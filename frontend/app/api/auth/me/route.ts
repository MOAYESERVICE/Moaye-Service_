import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  refreshCookieName,
  renewAuthTokens,
  setAuthCookies,
  sessionCookieName,
  type AuthTokens,
  type AuthUser,
} from "@/lib/server-auth";

const apiBaseUrl = (process.env.MOAYE_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

export async function GET() {
  const cookieStore = await cookies();
  let token = cookieStore.get(sessionCookieName)?.value;
  const refreshToken = cookieStore.get(refreshCookieName)?.value;
  let renewedTokens: AuthTokens | null = null;

  async function fetchCurrentUser(accessToken: string) {
    return fetch(`${apiBaseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  }

  let upstream: Response | null = null;
  try {
    if (token) upstream = await fetchCurrentUser(token);
  } catch {
    return NextResponse.json(
      { success: false, message: "Le service de connexion est momentanément indisponible." },
      { status: 503 },
    );
  }

  if ((!upstream || upstream.status === 401) && refreshToken) {
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
      const response = NextResponse.json(
        { success: false, message: "Session expirée." },
        { status: result.status === 401 ? 401 : 503 },
      );
      return result.status === 401 ? clearAuthCookies(response) : response;
    }

    renewedTokens = result.tokens;
    token = result.tokens.accessToken;
    try {
      upstream = await fetchCurrentUser(token);
    } catch {
      return setAuthCookies(
        NextResponse.json(
          { success: false, message: "Le service de connexion est momentanément indisponible." },
          { status: 503 },
        ),
        renewedTokens,
      );
    }
  }

  if (!upstream || !upstream.ok) {
    const response = NextResponse.json(
      {
        success: false,
        message:
          !token
            ? "Session absente."
            : upstream?.status === 401
              ? "Session expirée."
              : "Vérification de session impossible.",
      },
      { status: !token || upstream?.status === 401 ? 401 : 503 },
    );
    if (!token || upstream?.status === 401) return clearAuthCookies(response);
    return renewedTokens ? setAuthCookies(response, renewedTokens) : response;
  }

  let payload: { data?: { user?: AuthUser } };
  try {
    payload = await upstream.json();
  } catch {
    const invalidResponse = NextResponse.json(
      { success: false, message: "Réponse invalide du service de connexion." },
      { status: 502 },
    );
    return renewedTokens
      ? setAuthCookies(invalidResponse, renewedTokens)
      : invalidResponse;
  }

  const user = payload.data?.user;
  if (!user || (user.role !== "ADMIN" && user.role !== "CUSTOMER")) {
    const invalidResponse = NextResponse.json(
      { success: false, message: "Réponse invalide du service de connexion." },
      { status: 502 },
    );
    return renewedTokens
      ? setAuthCookies(invalidResponse, renewedTokens)
      : invalidResponse;
  }

  const response = NextResponse.json({
    success: true,
    data: { user: { ...user, role: user.role === "ADMIN" ? "admin" : "client" } },
  });
  return renewedTokens ? setAuthCookies(response, renewedTokens) : response;
}
