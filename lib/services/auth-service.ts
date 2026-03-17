import { compare } from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { createSessionToken, clearSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/schemas";

export async function loginUser(input: unknown) {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, message: "Credenziali non valide" };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.isActive) {
    return { ok: false as const, message: "Utente non trovato o disattivo" };
  }

  const isValid = await compare(parsed.data.password, user.passwordHash);
  if (!isValid) {
    return { ok: false as const, message: "Password errata" };
  }

  const token = await createSessionToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      eventType: "AUTH",
      severity: "INFO",
      action: "auth.login",
      message: "Login riuscito"
    }
  });

  return { ok: true as const, token };
}

export async function logoutUser() {
  await clearSessionCookie();
}
