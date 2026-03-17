import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { changeUserPassword } from "@/lib/services/user-service";
import { changePasswordSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Dati password non validi", errors: parsed.error.flatten() }, { status: 400 });
    }

    const result = await changeUserPassword(user.id, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "Password aggiornata" });
  } catch {
    return NextResponse.json({ message: "Errore aggiornamento password" }, { status: 500 });
  }
}
