import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionCookieOptions } from "@/lib/auth/session";
import { loginUser } from "@/lib/services/auth-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await loginUser(body);

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, result.token, getSessionCookieOptions());

    return response;
  } catch {
    return NextResponse.json({ message: "Errore interno durante il login" }, { status: 500 });
  }
}
