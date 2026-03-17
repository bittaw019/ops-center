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
      message: "Connessione Plesk API riuscita",
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

export class RealConnectionAdapter implements ConnectionAdapter {
  async testConnection(input: ConnectionTestInput): Promise<ConnectionTestResult> {
    if (input.provider === "PLESK") {
      return testPleskApi(input);
    }

    const started = Date.now();
    const client = new SftpClient();

    try {
      await client.connect(toSshConfig(input));
      await client.cwd();

      return {
        success: true,
        message: "Connessione SSH/SFTP riuscita",
        latencyMs: Date.now() - started
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Errore di connessione";
      return {
        success: false,
        message
      };
    } finally {
      await client.end().catch(() => undefined);
    }
  }
}
