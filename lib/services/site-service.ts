import { ConnectionProtocol, ConnectionStatus, EventType, Prisma, Severity } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { encryptSecret } from "@/lib/utils/crypto";
import { siteSchema, siteUpdateSchema } from "@/lib/validation/schemas";
import { RealConnectionAdapter } from "@/lib/services/adapters/real/real-connection-adapter";

const connectionAdapter = new RealConnectionAdapter();

export async function listSites() {
  return prisma.site.findMany({
    where: { isArchived: false },
    include: {
      tags: { include: { tag: true } },
      backups: { orderBy: { createdAt: "desc" }, take: 1 },
      healthChecks: { orderBy: { checkedAt: "desc" }, take: 1 },
      favoriteBy: true
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getSiteById(siteId: string) {
  return prisma.site.findUnique({
    where: { id: siteId },
    include: {
      connection: true,
      tags: { include: { tag: true } },
      backups: { orderBy: { createdAt: "desc" }, take: 10 },
      healthChecks: { orderBy: { checkedAt: "desc" }, take: 10 },
      releases: { orderBy: { createdAt: "desc" }, take: 6 },
      maintenanceChecks: { orderBy: { createdAt: "desc" }, take: 10 },
      fileOperations: { orderBy: { createdAt: "desc" }, take: 20 }
    }
  });
}

export async function createSite(input: unknown, userId: string) {
  const parsed = siteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: "Dati sito non validi", error: parsed.error.flatten() };
  }

  const data = parsed.data;

  try {
    const site = await prisma.site.create({
      data: {
        name: data.name,
        domain: data.domain,
        provider: data.provider,
        environment: data.environment,
        rootPath: data.rootPath,
        notes: data.notes,
        databaseBackupCommand: data.databaseBackupCommand,
        connection: {
          create: {
            host: data.host,
            port: data.port,
            username: data.username,
            protocol: data.connectionProtocol,
            authType: data.authType,
            encryptedSecret: encryptSecret(data.secret),
            encryptedSshKey: data.sshKey ? encryptSecret(data.sshKey) : null,
            pleskBaseUrl: data.pleskBaseUrl,
            encryptedPleskApiToken: data.pleskApiToken ? encryptSecret(data.pleskApiToken) : null,
            pleskSubscriptionId: data.pleskSubscriptionId,
            passphraseHint: data.passphraseHint
          }
        }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        siteId: site.id,
        eventType: EventType.SITE,
        severity: Severity.INFO,
        action: "site.created",
        message: `Creato sito ${site.name}`
      }
    });

    return { ok: true as const, site };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false as const, message: "Esiste gia un sito con questo dominio e ambiente" };
    }

    return { ok: false as const, message: "Errore interno creazione sito" };
  }
}

export async function updateSite(input: unknown, userId: string) {
  const parsed = siteUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: "Dati aggiornamento non validi", error: parsed.error.flatten() };
  }

  const { id, ...data } = parsed.data;

  if (data.host && !data.secret) {
    return { ok: false as const, message: "Per aggiornare la connessione devi fornire anche il secret" };
  }

  try {
    const site = await prisma.site.update({
      where: { id },
      data: {
        name: data.name,
        domain: data.domain,
        provider: data.provider,
        environment: data.environment,
        rootPath: data.rootPath,
        notes: data.notes,
        databaseBackupCommand: data.databaseBackupCommand,
        connection: data.host
          ? {
              upsert: {
                update: {
                  host: data.host,
                  port: data.port,
                  username: data.username,
                  protocol: data.connectionProtocol,
                  authType: data.authType,
                  encryptedSecret: data.secret ? encryptSecret(data.secret) : undefined,
                  encryptedSshKey: data.sshKey ? encryptSecret(data.sshKey) : null,
                  pleskBaseUrl: data.pleskBaseUrl,
                  encryptedPleskApiToken: data.pleskApiToken ? encryptSecret(data.pleskApiToken) : undefined,
                  pleskSubscriptionId: data.pleskSubscriptionId,
                  passphraseHint: data.passphraseHint
                },
                create: {
                  host: data.host,
                  port: data.port ?? 22,
                  username: data.username ?? "",
                  protocol: data.connectionProtocol ?? ConnectionProtocol.SFTP,
                  authType: data.authType ?? "password",
                  encryptedSecret: encryptSecret(data.secret ?? ""),
                  encryptedSshKey: data.sshKey ? encryptSecret(data.sshKey) : null,
                  pleskBaseUrl: data.pleskBaseUrl,
                  encryptedPleskApiToken: data.pleskApiToken ? encryptSecret(data.pleskApiToken) : null,
                  pleskSubscriptionId: data.pleskSubscriptionId,
                  passphraseHint: data.passphraseHint
                }
              }
            }
          : undefined
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        siteId: site.id,
        eventType: EventType.SITE,
        severity: Severity.INFO,
        action: "site.updated",
        message: `Aggiornato sito ${site.name}`
      }
    });

    return { ok: true as const, site };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false as const, message: "Esiste gia un sito con questo dominio e ambiente" };
    }

    return { ok: false as const, message: "Errore interno aggiornamento sito" };
  }
}

export async function archiveSite(siteId: string, userId: string) {
  const site = await prisma.site.update({
    where: { id: siteId },
    data: { isArchived: true }
  });

  await prisma.activityLog.create({
    data: {
      userId,
      siteId: site.id,
      eventType: EventType.SITE,
      severity: Severity.WARN,
      action: "site.archived",
      message: `Archiviato sito ${site.name}`
    }
  });

  return site;
}

export async function testSiteConnection(siteId: string, userId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { connection: true }
  });

  if (!site?.connection) {
    return { ok: false as const, message: "Connessione non configurata" };
  }

  const protocol = site.connection.protocol;

  const result = await connectionAdapter.testConnection({
    provider: site.provider,
    connectionProtocol: protocol,
    host: site.connection.host,
    port: site.connection.port,
    username: site.connection.username,
    authType: site.connection.authType as "password" | "ssh_key",
    encryptedSecret: site.connection.encryptedSecret,
    encryptedSshKey: site.connection.encryptedSshKey,
    pleskBaseUrl: site.connection.pleskBaseUrl,
    encryptedPleskApiToken: site.connection.encryptedPleskApiToken,
    pleskSubscriptionId: site.connection.pleskSubscriptionId
  });

  await prisma.siteConnection.update({
    where: { id: site.connection.id },
    data: {
      lastTestedAt: new Date(),
      lastTestResult: result.success,
      lastErrorMessage: result.success ? null : result.message
    }
  });

  await prisma.site.update({
    where: { id: site.id },
    data: {
      connectionStatus: result.success ? ConnectionStatus.OK : ConnectionStatus.FAILED,
      lastSeenAt: result.success ? new Date() : site.lastSeenAt
    }
  });

  await prisma.activityLog.create({
    data: {
      userId,
      siteId: site.id,
      eventType: EventType.CONNECTION,
      severity: result.success ? Severity.INFO : Severity.ERROR,
      action: result.success ? "connection.test.ok" : "connection.test.failed",
      message: result.message,
      metadata: { latencyMs: result.latencyMs, provider: site.provider, protocol }
    }
  });

  await prisma.notification.create({
    data: {
      userId,
      siteId,
      type: result.success ? "SUCCESS" : "ERROR",
      title: result.success ? "Test connessione riuscito" : "Test connessione fallito",
      body: `${site.name}: ${result.message}`
    }
  });

  return { ok: true as const, result };
}
