import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const siteBaseSchema = z.object({
  name: z.string().min(2).max(80),
  domain: z.string().min(3).max(255),
  provider: z.enum(["GENERIC", "PLESK"]).default("GENERIC"),
  environment: z.enum(["PROD", "STAGING", "DEV"]),
  rootPath: z.string().min(1).max(255),
  notes: z.string().max(2000).optional().nullable(),
  databaseBackupCommand: z.string().max(1000).optional().nullable(),
  host: z.string().min(2).max(255),
  port: z.number().int().min(1).max(65535),
  username: z.string().min(1).max(255),
  connectionProtocol: z.enum(["SFTP", "FTP", "FTPS"]).default("SFTP"),
  authType: z.enum(["password", "ssh_key"]),
  secret: z.string().min(2),
  sshKey: z.string().optional().nullable(),
  passphraseHint: z.string().max(255).optional().nullable(),
  pleskBaseUrl: z.string().url().optional().nullable(),
  pleskApiToken: z.string().min(10).optional().nullable(),
  pleskSubscriptionId: z.string().max(255).optional().nullable()
});

export const siteSchema = siteBaseSchema.superRefine((data, ctx) => {
  if (data.authType === "ssh_key" && data.secret.length < 20) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["secret"],
      message: "Per auth ssh_key inserisci la private key completa"
    });
  }

  if ((data.connectionProtocol === "FTP" || data.connectionProtocol === "FTPS") && data.authType !== "password") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["authType"],
      message: "FTP/FTPS supporta solo autenticazione password"
    });
  }

  if (data.provider === "PLESK") {
    if (!data.pleskBaseUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pleskBaseUrl"],
        message: "Per provider Plesk inserisci URL panel"
      });
    }

    if (!data.pleskApiToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pleskApiToken"],
        message: "Per provider Plesk inserisci API token"
      });
    }
  }
});

export const siteUpdateSchema = siteBaseSchema.partial().extend({ id: z.string().cuid() });

export const fileActionSchema = z.object({
  action: z.enum(["LIST", "UPLOAD", "DOWNLOAD", "RENAME", "DELETE", "MKDIR"]),
  path: z.string().min(1),
  targetPath: z.string().optional(),
  contentBase64: z.string().optional()
});

export const backupRequestSchema = z.object({
  siteId: z.string().cuid(),
  type: z.enum(["FILES", "DATABASE", "FULL"])
});

export const logFilterSchema = z.object({
  siteId: z.string().cuid().optional(),
  severity: z.enum(["INFO", "WARN", "ERROR", "CRITICAL"]).optional(),
  eventType: z.enum(["AUTH", "SITE", "CONNECTION", "FILE", "BACKUP", "HEALTH", "SYSTEM"]).optional(),
  query: z.string().max(100).optional()
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(255),
  timezone: z.string().min(2).max(100),
  locale: z.string().min(2).max(20),
  theme: z.enum(["dark", "light"]),
  receiveEmails: z.boolean()
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(128),
    newPassword: z.string().min(10).max(128)
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "La nuova password deve essere diversa da quella attuale"
  });
