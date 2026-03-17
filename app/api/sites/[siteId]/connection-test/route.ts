import { NextResponse } from "next/server";
import { RoleName } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/server";
import { canWrite } from "@/lib/rbac/permissions";
import { testSiteConnection } from "@/lib/services/site-service";

export async function POST(_: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!canWrite(user.role as RoleName)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const { siteId } = await params;
    const result = await testSiteConnection(siteId, user.id);

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({ result: result.result });
  } catch {
    return NextResponse.json({ message: "Errore durante test connessione" }, { status: 500 });
  }
}
