import fs from "fs/promises";
import path from "path";
import { createHash } from "crypto";
import { Client } from "ssh2";
import SftpClient from "ssh2-sftp-client";
import archiver from "archiver";
import { decryptSecret } from "@/lib/utils/crypto";
import type { BackupAdapter, BackupExecutionInput, BackupExecutionResult } from "@/lib/services/adapters/contracts/backup-adapter";

type SshConfig = {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  readyTimeout: number;
};

type FileEntry = { name: string; type: string };

function toSshConfig(input: BackupExecutionInput["connection"]): SshConfig {
  if (input.authType === "password") {
    return {
      host: input.host,
      port: input.port,
      username: input.username,
      password: decryptSecret(input.encryptedSecret),
      readyTimeout: 15000
    };
  }

  return {
    host: input.host,
    port: input.port,
    username: input.username,
    privateKey: decryptSecret(input.encryptedSecret),
    passphrase: input.encryptedSshKey ? decryptSecret(input.encryptedSshKey) : undefined,
    readyTimeout: 15000
  };
}

async function downloadTree(sftp: any, remoteDir: string, localDir: string) {
  await fs.mkdir(localDir, { recursive: true });
  const entries = (await sftp.list(remoteDir)) as FileEntry[];

  for (const entry of entries) {
    const remotePath = path.posix.join(remoteDir, entry.name);
    const localPath = path.join(localDir, entry.name);

    if (entry.type === "d") {
      await downloadTree(sftp, remotePath, localPath);
    } else if (entry.type === "-") {
      const content = await sftp.get(remotePath);
      if (Buffer.isBuffer(content)) {
        await fs.writeFile(localPath, content);
      }
    }
  }
}

async function zipDirectory(sourceDir: string, targetZip: string) {
  await fs.mkdir(path.dirname(targetZip), { recursive: true });

  return new Promise<void>((resolve, reject) => {
    const output = require("fs").createWriteStream(targetZip);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    archive.on("error", (error: unknown) => reject(error));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize().catch(reject);
  });
}

function runRemoteCommand(config: SshConfig, command: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const conn: any = new Client();
    const chunks: Buffer[] = [];
    const errors: Buffer[] = [];

    conn
      .on("ready", () => {
        conn.exec(command, (err: unknown, stream: any) => {
          if (err) {
            conn.end();
            reject(err);
            return;
          }

          stream.on("data", (data: Buffer) => chunks.push(data));
          stream.stderr.on("data", (data: Buffer) => errors.push(data));

          stream.on("close", (code: number) => {
            conn.end();
            if (code !== 0) {
              reject(new Error(Buffer.concat(errors).toString("utf8") || `Comando terminato con codice ${code}`));
              return;
            }
            resolve(Buffer.concat(chunks));
          });
        });
      })
      .on("error", (error: unknown) => reject(error))
      .connect(config);
  });
}

export class RealBackupAdapter implements BackupAdapter {
  async execute(input: BackupExecutionInput): Promise<BackupExecutionResult> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const slug = input.siteName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const workDir = path.join(process.cwd(), "storage", "tmp", `${slug}-${timestamp}`);
    const finalZip = path.join(process.cwd(), "storage", "backups", slug, `${timestamp}.zip`);
    const sshConfig = toSshConfig(input.connection);

    try {
      await fs.mkdir(workDir, { recursive: true });

      if (input.type === "FILES" || input.type === "FULL") {
        const sftp = new SftpClient();
        await sftp.connect(sshConfig);
        await downloadTree(sftp, input.connection.rootPath, path.join(workDir, "files"));
        await sftp.end();
      }

      if (input.type === "DATABASE" || input.type === "FULL") {
        if (!input.databaseBackupCommand) {
          throw new Error("DATABASE_BACKUP_COMMAND non configurato per questo sito");
        }

        const dump = await runRemoteCommand(sshConfig, input.databaseBackupCommand);
        await fs.writeFile(path.join(workDir, "database.sql"), dump);
      }

      await zipDirectory(workDir, finalZip);
      const fileBuffer = await fs.readFile(finalZip);
      const checksum = createHash("sha256").update(fileBuffer).digest("hex");
      const stats = await fs.stat(finalZip);

      return {
        success: true,
        message: "Backup completato",
        storagePath: finalZip,
        checksum,
        sizeMb: Number((stats.size / (1024 * 1024)).toFixed(2))
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Errore backup"
      };
    } finally {
      await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}

