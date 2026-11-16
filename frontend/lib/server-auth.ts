import { NextResponse } from "next/server";

export const sessionCookieName = "moaye-access";
export const refreshCookieName = "moaye-refresh";

const apiBaseUrl = (process.env.MOAYE_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export function setAuthCookies(response: NextResponse, tokens: AuthTokens) {
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(sessionCookieName, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  response.cookies.set(refreshCookieName, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(refreshCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function renewAuthTokens(refreshToken: string) {
  let upstream: Response;
  try {
    upstream = await fetch(`${apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Le service de renouvellement de session est indisponible.");
  }

  if (!upstream.ok) {
    return { ok: false as const, status: upstream.status };
  }

  let payload: { data?: Partial<AuthTokens> };
  try {
    payload = await upstream.json();
  } catch {
    throw new Error("Réponse invalide du service de renouvellement.");
  }

  const accessToken = payload.data?.accessToken;
  const rotatedRefreshToken = payload.data?.refreshToken;
  if (!accessToken || !rotatedRefreshToken) {
    throw new Error("Le service n’a pas renvoyé les jetons renouvelés.");
  }

  return {
    ok: true as const,
    tokens: {
      accessToken,
      refreshToken: rotatedRefreshToken,
    },
  };
}

export async function forwardAuth(path: "login" | "register" | "change-password", body: Record<string, string>) {
  let upstream: Response;
  try {
    upstream = await fetch(`${apiBaseUrl}/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Le service de connexion est momentanément indisponible." },
      { status: 503 },
    );
  }

  let payload: {
    success?: boolean;
    message?: string;
    data?: { accessToken?: string; refreshToken?: string; user?: AuthUser };
  };
  try {
    payload = await upstream.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Réponse invalide du service de connexion." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { success: false, message: payload.message ?? "La demande n’a pas abouti. Veuillez vérifier les informations saisies et réessayer." },
      { status: upstream.status },
    );
  }

  const token = payload.data?.accessToken;
  const refreshToken = payload.data?.refreshToken;
  const user = payload.data?.user;
  if (!token || !refreshToken || !user || (user.role !== "ADMIN" && user.role !== "CUSTOMER")) {
    return NextResponse.json(
      { success: false, message: "Le service de connexion a renvoyé une réponse incomplète." },
      { status: 502 },
    );
  }

  const response = NextResponse.json({
    success: true,
    data: { user: { ...user, role: user.role === "ADMIN" ? "admin" : "client" } },
  });
  return setAuthCookies(response, { accessToken: token, refreshToken });
}

export async function forwardPasswordRecovery(path: "forgot-password" | "reset-password", body: Record<string, string>) {
  let upstream: Response;
  try {
    upstream = await fetch(`${apiBaseUrl}/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Le service de récupération est momentanément indisponible." },
      { status: 503 },
    );
  }

  let payload: { success?: boolean; message?: string };
  try {
    payload = await upstream.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Réponse invalide du service de récupération." },
      { status: 502 },
    );
  }

  return NextResponse.json(
    { success: Boolean(payload.success), message: payload.message ?? "La demande n’a pas abouti. Réessayez." },
    { status: upstream.status },
  );
}

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
};
