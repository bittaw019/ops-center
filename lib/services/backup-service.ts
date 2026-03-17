import { BackupStatus, BackupType, EventType, Severity } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { backupRequestSchema } from "@/lib/validation/schemas";
import { RealBackupAdapter } from "@/lib/services/adapters/real/real-backup-adapter";

const backupAdapter = new RealBackupAdapter();

export async function runManualBackup(input: unknown, userId: string) {
  const parsed = backupRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: "Input backup non valido" };
  }

  const site = await prisma.site.findUnique({
    where: { id: parsed.data.siteId },
    include: { connection: true }
  });

  if (!site) {
    return { ok: false as const, message: "Sito non trovato" };
  }

  if (!site.connection) {
    return { ok: false as const, message: "Connessione sito non configurata" };
  }

  const backup = await prisma.backup.create({
    data: {
      siteId: site.id,
      type: parsed.data.type as BackupType,
      status: BackupStatus.RUNNING,
      startedAt: new Date(),
      triggerSource: "manual"
    }
  });

  const result = await backupAdapter.execute({
    siteName: site.name,
    siteDomain: site.domain,
    type: parsed.data.type,
    databaseBackupCommand: site.databaseBackupCommand,
    connection: {
      host: site.connection.host,
      port: site.connection.port,
      username: site.connection.username,
      authType: site.connection.authType as "password" | "ssh_key",
      encryptedSecret: site.connection.encryptedSecret,
      encryptedSshKey: site.connection.encryptedSshKey,
      rootPath: site.rootPath
    }
  });

  const updated = await prisma.backup.update({
    where: { id: backup.id },
    data: {
      status: result.success ? BackupStatus.SUCCESS : BackupStatus.FAILED,
      completedAt: new Date(),
      storagePath: result.storagePath,
      checksum: result.checksum,
      sizeMb: result.sizeMb,
      message: result.message,
      restoreReady: result.success
    }
  });

  await prisma.activityLog.create({
    data: {
      userId,
      siteId: site.id,
      eventType: EventType.BACKUP,
      severity: result.success ? Severity.INFO : Severity.ERROR,
      action: result.success ? "backup.success" : "backup.failed",
      message: result.message,
      metadata: { backupId: backup.id, backupType: parsed.data.type }
    }
  });

  await prisma.notification.create({
    data: {
      userId,
      siteId: site.id,
      type: result.success ? "SUCCESS" : "ERROR",
      title: result.success ? "Backup completato" : "Backup fallito",
      body: `${site.name}: ${result.message}`
    }
  });

  return { ok: true as const, backup: updated };
}

export async function listBackups() {
  return prisma.backup.findMany({
    include: { site: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });
}
