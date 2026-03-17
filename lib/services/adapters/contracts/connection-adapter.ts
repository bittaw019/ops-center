export type ConnectionTestInput = {
  provider: "GENERIC" | "PLESK";
  host: string;
  port: number;
  username: string;
  authType: "password" | "ssh_key";
  encryptedSecret: string;
  encryptedSshKey?: string | null;
  pleskBaseUrl?: string | null;
  encryptedPleskApiToken?: string | null;
  pleskSubscriptionId?: string | null;
};

export type ConnectionTestResult = {
  success: boolean;
  message: string;
  latencyMs?: number;
};

export interface ConnectionAdapter {
  testConnection(input: ConnectionTestInput): Promise<ConnectionTestResult>;
}
