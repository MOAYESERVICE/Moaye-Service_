import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  refreshCookieName,
  renewAuthTokens,
  setAuthCookies,
} from "@/lib/server-auth";

export async function POST() {
  const refreshToken = (await cookies()).get(refreshCookieName)?.value;
  if (!refreshToken) {
    return clearAuthCookies(
      NextResponse.json(
        { success: false, message: "Session expirée. Connectez-vous à nouveau." },
        { status: 401 },
      ),
    );
  }

  try {
    const result = await renewAuthTokens(refreshToken);
    if (!result.ok) {
      const response = NextResponse.json(
        { success: false, message: "Session expirée. Connectez-vous à nouveau." },
        { status: result.status === 401 ? 401 : 502 },
      );
      return result.status === 401 ? clearAuthCookies(response) : response;
    }

    return setAuthCookies(
      NextResponse.json({ success: true }),
      result.tokens,
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Le renouvellement de session a échoué.",
      },
      { status: 503 },
    );
  }
}
