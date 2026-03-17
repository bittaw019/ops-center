import { redirect } from "next/navigation";
import { RoleName } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSessionCookie, verifySessionToken } from "@/lib/auth/session";

export async function getCurrentUser() {
  const token = await getSessionCookie();
  if (!token) return null;

  try {
    const payload = await verifySessionToken(token);
    return await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true }
    });
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(roles: RoleName[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/dashboard");
  }
  return user;
}
