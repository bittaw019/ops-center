import { Client as FtpClient } from "basic-ftp";
import SftpClient from "ssh2-sftp-client";
import { decryptSecret } from "@/lib/utils/crypto";
import type { ConnectionAdapter, ConnectionTestInput, ConnectionTestResult } from "@/lib/services/adapters/contracts/connection-adapter";

type SshConfig = {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  readyTimeout: number;
};

function toSshConfig(input: ConnectionTestInput): SshConfig {
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

async function testPleskApi(input: ConnectionTestInput): Promise<ConnectionTestResult> {
  if (!input.pleskBaseUrl || !input.encryptedPleskApiToken) {
    return { success: false, message: "Configurazione API Plesk incompleta" };
  }

  const started = Date.now();
  const token = decryptSecret(input.encryptedPleskApiToken);
  const baseUrl = input.pleskBaseUrl.replace(/\/+$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${baseUrl}/api/v2/server`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Plesk API non raggiungibile (${response.status})`
      };
    }

    return {
      success: true,
      message: "Plesk API raggiungibile",
      latencyMs: Date.now() - started
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Errore connessione API Plesk"
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function testSftpConnection(input: ConnectionTestInput): Promise<ConnectionTestResult> {
  const started = Date.now();
  const client = new SftpClient();

  try {
    await client.connect(toSshConfig(input));
    await client.cwd();

    return {
      success: true,
      message: "Connessione SFTP riuscita",
      latencyMs: Date.now() - started
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Errore connessione SFTP"
    };
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function testFtpConnection(input: ConnectionTestInput): Promise<ConnectionTestResult> {
  if (input.authType !== "password") {
    return { success: false, message: "FTP/FTPS supporta solo auth password" };
  }

  const started = Date.now();
  const client = new FtpClient(12000);

  try {
    await client.access({
      host: input.host,
      port: input.port,
      user: input.username,
      password: decryptSecret(input.encryptedSecret),
      secure: input.connectionProtocol === "FTPS"
    });

    await client.list();

    return {
      success: true,
      message: input.connectionProtocol === "FTPS" ? "Connessione FTPS riuscita" : "Connessione FTP riuscita",
      latencyMs: Date.now() - started
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Errore connessione FTP/FTPS"
    };
  } finally {
    client.close();
  }
}

async function testTransferConnection(input: ConnectionTestInput): Promise<ConnectionTestResult> {
  if (input.connectionProtocol === "SFTP") {
    return testSftpConnection(input);
  }

  return testFtpConnection(input);
}

export class RealConnectionAdapter implements ConnectionAdapter {
  async testConnection(input: ConnectionTestInput): Promise<ConnectionTestResult> {
    if (input.provider === "PLESK") {
      const apiResult = await testPleskApi(input);
      if (!apiResult.success) {
        return apiResult;
      }

      const transferResult = await testTransferConnection(input);
      if (!transferResult.success) {
        return {
          success: false,
          message: `API Plesk ok, ma connessione ${input.connectionProtocol} fallita: ${transferResult.message}`
        };
      }

      return {
        success: true,
        message: `Plesk API e ${input.connectionProtocol} raggiungibili`,
        latencyMs: transferResult.latencyMs
      };
    }

    return testTransferConnection(input);
  }
}
