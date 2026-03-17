export type BackupConnectionInput = {
  host: string;
  port: number;
  username: string;
  authType: "password" | "ssh_key";
  encryptedSecret: string;
  encryptedSshKey?: string | null;
  rootPath: string;
};

export type BackupExecutionInput = {
  siteName: string;
  siteDomain: string;
  type: "FILES" | "DATABASE" | "FULL";
  connection: BackupConnectionInput;
  databaseBackupCommand?: string | null;
};

export type BackupExecutionResult = {
  success: boolean;
  message: string;
  storagePath?: string;
  checksum?: string;
  sizeMb?: number;
};

export interface BackupAdapter {
  execute(input: BackupExecutionInput): Promise<BackupExecutionResult>;
}
