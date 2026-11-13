import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  clearAuthCookies,
  refreshCookieName,
  renewAuthTokens,
  setAuthCookies,
  sessionCookieName,
  type AuthTokens,
} from "./lib/server-auth";

const apiBaseUrl = (process.env.MOAYE_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

export async function proxy(req: NextRequest) {
  if (
    process.env.NODE_ENV === "development" &&
    (req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/mon-compte"))
  ) {
    return NextResponse.next();
  }

  let token = req.cookies.get(sessionCookieName)?.value;
  const refreshToken = req.cookies.get(refreshCookieName)?.value;
  let renewedTokens: AuthTokens | null = null;
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/connexion";

  const loginRedirect = () =>
    clearAuthCookies(NextResponse.redirect(loginUrl));

  async function fetchCurrentUser(accessToken: string) {
    return fetch(`${apiBaseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  }

  let response: Response | null = null;
  if (token) {
    try {
      response = await fetchCurrentUser(token);
    } catch {
      return NextResponse.json(
        { success: false, message: "Vérification de session indisponible. Réessayez dans quelques instants." },
        { status: 503 },
      );
    }
  }

  if ((!response || response.status === 401) && refreshToken) {
    let result: Awaited<ReturnType<typeof renewAuthTokens>>;
    try {
      result = await renewAuthTokens(refreshToken);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : "Renouvellement de session impossible.",
        },
        { status: 503 },
      );
    }

    if (!result.ok) {
      if (result.status === 401) return loginRedirect();
      return NextResponse.json(
        { success: false, message: "Renouvellement de session impossible." },
        { status: 503 },
      );
    }

    renewedTokens = result.tokens;
    token = result.tokens.accessToken;
    try {
      response = await fetchCurrentUser(token);
    } catch {
      return setAuthCookies(
        NextResponse.json(
          { success: false, message: "Vérification de session indisponible. Réessayez dans quelques instants." },
          { status: 503 },
        ),
        renewedTokens,
      );
    }
  }

  if (!response || response.status === 401) {
    return loginRedirect();
  }
  if (!response.ok) {
    const unavailable = NextResponse.json(
      { success: false, message: "Vérification de session impossible." },
      { status: 503 },
    );
    return renewedTokens ? setAuthCookies(unavailable, renewedTokens) : unavailable;
  }

  let payload: { data?: { user?: { role?: string } } };
  try {
    payload = await response.json();
  } catch {
    const invalidResponse = NextResponse.json(
      { success: false, message: "Réponse de session invalide." },
      { status: 502 },
    );
    return renewedTokens
      ? setAuthCookies(invalidResponse, renewedTokens)
      : invalidResponse;
  }

  if (!payload.data?.user?.role) {
    const invalidResponse = NextResponse.json(
      { success: false, message: "Réponse de session invalide." },
      { status: 502 },
    );
    return renewedTokens
      ? setAuthCookies(invalidResponse, renewedTokens)
      : invalidResponse;
  }

  if (req.nextUrl.pathname.startsWith("/admin") && payload.data.user.role !== "ADMIN") {
    const accountUrl = req.nextUrl.clone();
    accountUrl.pathname = "/mon-compte";
    const redirect = NextResponse.redirect(accountUrl);
    return renewedTokens ? setAuthCookies(redirect, renewedTokens) : redirect;
  }

  const next = NextResponse.next();
  return renewedTokens ? setAuthCookies(next, renewedTokens) : next;
}

export const config = { matcher: ["/mon-compte/:path*", "/admin/:path*"] };
