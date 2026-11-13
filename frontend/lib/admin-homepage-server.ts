import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/server-auth";

const apiBaseUrl = (process.env.MOAYE_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

export async function forwardAdminHomepage(request: Request, method: "GET" | "PUT", productKey?: string) {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Session d’administration absente ou expirée. Reconnectez-vous, puis réessayez." },
      { status: 401 },
    );
  }

  let body: string | undefined;
  if (method === "PUT") {
    try {
      const payload: unknown = await request.json();
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("invalid payload");
      body = JSON.stringify(payload);
    } catch {
      return NextResponse.json({ success: false, message: "Contenu de carte invalide." }, { status: 400 });
    }
  }

  const path = productKey
    ? `/home/photos/${encodeURIComponent(productKey)}`
    : "/home/photos/admin";
  let upstream: Response;
  try {
    upstream = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body } : {}),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ success: false, message: "Le service des cartes d’accueil est indisponible." }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await upstream.json();
  } catch {
    return NextResponse.json({ success: false, message: "Réponse invalide du backend." }, { status: 502 });
  }
  return NextResponse.json(payload, { status: upstream.status });
}
