import type { ConnectionAdapter, ConnectionTestInput, ConnectionTestResult } from "@/lib/services/adapters/contracts/connection-adapter";

export class MockConnectionAdapter implements ConnectionAdapter {
  async testConnection(input: ConnectionTestInput): Promise<ConnectionTestResult> {
    const shouldFail = input.host.includes("staging") || input.host.includes("fail");

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (shouldFail) {
      return {
        success: false,
        message: "Handshake timeout durante test SSH/SFTP"
      };
    }

    return {
      success: true,
      message: "Connessione SSH/SFTP stabilita",
      latencyMs: 142
    };
  }
}
