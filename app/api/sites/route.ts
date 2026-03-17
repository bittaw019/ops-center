import { NextResponse } from "next/server";
import { RoleName } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/server";
import { listSites, createSite } from "@/lib/services/site-service";
import { canWrite } from "@/lib/rbac/permissions";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const sites = await listSites();
    return NextResponse.json({ data: sites });
  } catch {
    return NextResponse.json({ message: "Errore caricamento siti" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!canWrite(user.role as RoleName)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const result = await createSite(body, user.id);

    if (!result.ok) {
      return NextResponse.json({ message: result.message ?? "Dati sito non validi", errors: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.site });
  } catch {
    return NextResponse.json({ message: "Errore creazione sito" }, { status: 500 });
  }
}
