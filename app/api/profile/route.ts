import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { updateUserProfile } from "@/lib/services/user-service";
import { profileUpdateSchema } from "@/lib/validation/schemas";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Dati profilo non validi", errors: parsed.error.flatten() }, { status: 400 });
    }

    const result = await updateUserProfile(user.id, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      data: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        profile: result.user.profile
      }
    });
  } catch {
    return NextResponse.json({ message: "Errore aggiornamento profilo" }, { status: 500 });
  }
}
