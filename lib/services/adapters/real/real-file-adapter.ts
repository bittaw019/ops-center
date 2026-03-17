import path from "path";
import SftpClient from "ssh2-sftp-client";
import { decryptSecret } from "@/lib/utils/crypto";
import { resolveRemotePath, toUnixPermissions } from "@/lib/services/adapters/real/sftp-utils";
import type { FileActionInput, FileActionResult, FileManagerAdapter, RemoteFileNode } from "@/lib/services/adapters/contracts/file-adapter";

type SshConfig = {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  readyTimeout: number;
};

type FileEntry = {
  name: string;
  type: string;
  size?: number;
  modifyTime?: number;
  mode?: number;
};

function toSshConfig(input: FileActionInput["connection"]): SshConfig {
  if (input.authType === "password") {
    return {
      host: input.host,
      port: input.port,
      username: input.username,
      password: decryptSecret(input.encryptedSecret),
      readyTimeout: 10000
    };
  }

  return {
    host: input.host,
    port: input.port,
    username: input.username,
    privateKey: decryptSecret(input.encryptedSecret),
    passphrase: input.encryptedSshKey ? decryptSecret(input.encryptedSshKey) : undefined,
    readyTimeout: 10000
  };
}

function toNode(entry: FileEntry, parentPath: string): RemoteFileNode {
  return {
    path: parentPath,
    name: entry.name,
    kind: entry.type === "d" ? "dir" : "file",
    size: Number(entry.size ?? 0),
    modifiedAt: new Date(entry.modifyTime ?? Date.now()).toISOString(),
    permissions: toUnixPermissions(entry.mode)
  };
}

export class RealFileManagerAdapter implements FileManagerAdapter {
  async perform(input: FileActionInput): Promise<FileActionResult> {
    const client = new SftpClient();

    try {
      await client.connect(toSshConfig(input.connection));
      const remotePath = resolveRemotePath(input.connection.rootPath, input.path);

      switch (input.action) {
        case "LIST": {
          const entries = (await client.list(remotePath)) as FileEntry[];
          return {
            success: true,
            message: `Directory letta: ${input.path}`,
            nodes: entries.map((entry: FileEntry) => toNode(entry, input.path))
          };
        }
        case "MKDIR": {
          await client.mkdir(remotePath, true);
          return { success: true, message: `Cartella creata: ${input.path}` };
        }
        case "DELETE": {
          const kind = await client.exists(remotePath);
          if (kind === "d") {
            await client.rmdir(remotePath, true);
          } else {
            await client.delete(remotePath);
          }
          return { success: true, message: `Eliminato: ${input.path}` };
        }
        case "RENAME": {
          if (!input.targetPath) {
            return { success: false, message: "targetPath obbligatorio per rename" };
          }
          const target = resolveRemotePath(input.connection.rootPath, input.targetPath);
          await client.rename(remotePath, target);
          return { success: true, message: `Rinominato ${input.path} -> ${input.targetPath}` };
        }
        case "DOWNLOAD": {
          const content = await client.get(remotePath);
          if (!Buffer.isBuffer(content)) {
            return { success: false, message: "Download non disponibile per il file richiesto" };
          }
          return {
            success: true,
            message: `Download pronto: ${path.posix.basename(remotePath)}`,
            downloadContentBase64: content.toString("base64")
          };
        }
        case "UPLOAD": {
          if (!input.contentBase64) {
            return { success: false, message: "contentBase64 obbligatorio per upload" };
          }
          const payload = Buffer.from(input.contentBase64, "base64");
          await client.put(payload, remotePath);
          return { success: true, message: `Upload completato: ${input.path}` };
        }
        default:
          return { success: false, message: "Azione non supportata" };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Errore operazione file"
      };
    } finally {
      await client.end().catch(() => undefined);
    }
  }
}
