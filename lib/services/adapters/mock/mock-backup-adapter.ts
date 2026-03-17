import type { BackupAdapter, BackupExecutionInput, BackupExecutionResult } from "@/lib/services/adapters/contracts/backup-adapter";

export class MockBackupAdapter implements BackupAdapter {
  async execute(input: BackupExecutionInput): Promise<BackupExecutionResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (input.siteDomain.includes("staging")) {
      return {
        success: false,
        message: "Impossibile raggiungere host remoto durante export"
      };
    }

    const stamp = new Date().toISOString().replaceAll(":", "-");

    return {
      success: true,
      message: "Backup completato con successo",
      storagePath: `s3://ops-backups/${input.siteName.toLowerCase().replace(/\s+/g, "-")}/${stamp}.tar.gz`,
      checksum: `sha256-${Math.random().toString(36).slice(2, 12)}`,
      sizeMb: Number((100 + Math.random() * 1100).toFixed(2))
    };
  }
}
