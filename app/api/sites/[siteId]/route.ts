import { NextResponse } from "next/server";
import { RoleName } from "@prisma/client";
import { canWrite } from "@/lib/rbac/permissions";
import { getCurrentUser } from "@/lib/auth/server";
import { archiveSite, getSiteById, updateSite } from "@/lib/services/site-service";

export async function GET(_: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { siteId } = await params;
    const site = await getSiteById(siteId);
    if (!site) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ data: site });
  } catch {
    return NextResponse.json({ message: "Errore caricamento sito" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!canWrite(user.role as RoleName)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const { siteId } = await params;
    const body = await request.json();
    const result = await updateSite({ ...body, id: siteId }, user.id);

    if (!result.ok) {
      return NextResponse.json({ message: result.message ?? "Payload non valido", errors: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.site });
  } catch {
    return NextResponse.json({ message: "Errore aggiornamento sito" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (!canWrite(user.role as RoleName)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const { siteId } = await params;
    await archiveSite(siteId, user.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Errore archiviazione sito" }, { status: 500 });
  }
}
