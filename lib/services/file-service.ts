import { EventType, Severity } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { fileActionSchema } from "@/lib/validation/schemas";
import { RealFileManagerAdapter } from "@/lib/services/adapters/real/real-file-adapter";

const fileAdapter = new RealFileManagerAdapter();

export async function performFileOperation(siteId: string, userId: string, input: unknown) {
  const parsed = fileActionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: "Input operazione file non valido" };
  }

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { connection: true }
  });

  if (!site?.connection) {
    return { ok: false as const, message: "Connessione sito non configurata" };
  }

  const result = await fileAdapter.perform({
    ...parsed.data,
    connection: {
      connectionProtocol: site.connection.protocol,
      host: site.connection.host,
      port: site.connection.port,
      username: site.connection.username,
      authType: site.connection.authType as "password" | "ssh_key",
      encryptedSecret: site.connection.encryptedSecret,
      encryptedSshKey: site.connection.encryptedSshKey,
      rootPath: site.rootPath
    }
  });

  await prisma.fileOperation.create({
    data: {
      siteId,
      userId,
      operation: parsed.data.action,
      path: parsed.data.path,
      success: result.success,
      message: result.message
    }
  });

  await prisma.activityLog.create({
    data: {
      siteId,
      userId,
      eventType: EventType.FILE,
      severity: result.success ? Severity.INFO : Severity.ERROR,
      action: `file.${parsed.data.action.toLowerCase()}`,
      message: result.message,
      metadata: {
        path: parsed.data.path,
        targetPath: parsed.data.targetPath
      }
    }
  });

  if (!result.success) {
    return { ok: false as const, message: result.message };
  }

  return { ok: true as const, result };
}
