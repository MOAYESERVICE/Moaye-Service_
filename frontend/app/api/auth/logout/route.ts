import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  refreshCookieName,
} from "@/lib/server-auth";

const apiBaseUrl = (
  process.env.MOAYE_API_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");

export async function POST() {
  const refreshToken = (await cookies()).get(refreshCookieName)?.value;
  if (!refreshToken) {
    return clearAuthCookies(NextResponse.json({ success: true }));
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
  } catch {
    return clearAuthCookies(
      NextResponse.json(
        {
          success: false,
          message: "Session locale effacée, mais la révocation serveur n’a pas pu être confirmée.",
        },
        { status: 503 },
      ),
    );
  }

  if (!upstream.ok && upstream.status !== 404 && upstream.status !== 401) {
    return clearAuthCookies(
      NextResponse.json(
        {
          success: false,
          message: "Session locale effacée, mais la révocation serveur a échoué.",
        },
        { status: 502 },
      ),
    );
  }

  return clearAuthCookies(NextResponse.json({ success: true }));
}
