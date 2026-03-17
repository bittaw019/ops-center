import { compare, hash } from "bcryptjs";
import { EventType, Prisma, Severity } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

type ProfileUpdateInput = {
  name: string;
  email: string;
  timezone: string;
  locale: string;
  theme: "dark" | "light";
  receiveEmails: boolean;
};

type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export async function getUserProfileOverview(userId: string) {
  const [user, lastLogin, actionsLast30Days, unreadNotifications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    }),
    prisma.activityLog.findFirst({
      where: { userId, eventType: EventType.AUTH, action: "auth.login" },
      orderBy: { createdAt: "desc" }
    }),
    prisma.activityLog.count({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) }
      }
    }),
    prisma.notification.count({
      where: {
        isRead: false,
        OR: [{ userId }, { userId: null }]
      }
    })
  ]);

  if (!user) return null;

  return {
    user,
    stats: {
      lastLoginAt: lastLogin?.createdAt ?? null,
      actionsLast30Days,
      unreadNotifications
    }
  };
}

export async function updateUserProfile(userId: string, input: ProfileUpdateInput) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        email: input.email,
        profile: {
          upsert: {
            update: {
              timezone: input.timezone,
              locale: input.locale,
              theme: input.theme,
              receiveEmails: input.receiveEmails
            },
            create: {
              timezone: input.timezone,
              locale: input.locale,
              theme: input.theme,
              receiveEmails: input.receiveEmails
            }
          }
        }
      },
      include: { profile: true }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        eventType: EventType.SYSTEM,
        severity: Severity.INFO,
        action: "user.profile.updated",
        message: "Profilo utente aggiornato"
      }
    });

    return { ok: true as const, user };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false as const, message: "Email gia in uso da un altro account" };
    }

    return { ok: false as const, message: "Errore durante aggiornamento profilo" };
  }
}

export async function changeUserPassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { ok: false as const, message: "Utente non trovato" };
  }

  const matches = await compare(input.currentPassword, user.passwordHash);
  if (!matches) {
    return { ok: false as const, message: "Password attuale non corretta" };
  }

  const newHash = await hash(input.newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash }
  });

  await prisma.activityLog.create({
    data: {
      userId,
      eventType: EventType.AUTH,
      severity: Severity.INFO,
      action: "auth.password.changed",
      message: "Password account aggiornata"
    }
  });

  return { ok: true as const };
}
