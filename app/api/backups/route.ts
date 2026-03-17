import { NextResponse } from "next/server";
import { RoleName } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/server";
import { canWrite } from "@/lib/rbac/permissions";
import { runManualBackup } from "@/lib/services/backup-service";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!canWrite(user.role as RoleName)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const result = await runManualBackup(body, user.id);

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({ data: result.backup, message: "Backup completato" });
  } catch {
    return NextResponse.json({ message: "Errore durante backup" }, { status: 500 });
  }
}
