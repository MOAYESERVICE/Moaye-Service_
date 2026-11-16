import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/server-auth";

const configuredApi = (process.env.MOAYE_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

export async function forwardAdminRealisations(request: Request, method: "GET" | "POST" | "PUT" | "DELETE", id?: string, resource: "projects" | "photos" = "projects") {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "Session expirée. Reconnectez-vous, puis réessayez." }, { status: 401 });
  }

  let body: string | undefined;
  if (method === "POST" || method === "PUT") {
    try {
      body = JSON.stringify(await request.json());
    } catch {
      return NextResponse.json({ success: false, message: "Informations de réalisation invalides." }, { status: 400 });
    }
  }

  const path = resource === "photos"
    ? id ? `/realisations/photos/${encodeURIComponent(id)}` : method === "GET" ? "/realisations/photos/admin" : "/realisations/photos"
    : id ? `/realisations/${encodeURIComponent(id)}` : method === "GET" ? "/realisations/admin" : "/realisations";
  let upstream: Response;
  try {
    upstream = await fetch(`${configuredApi}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body } : {}),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ success: false, message: "Le service des réalisations est indisponible." }, { status: 503 });
  }

  const payload = await upstream.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ success: false, message: "Réponse invalide du serveur." }, { status: 502 });
  }
  return NextResponse.json(payload, { status: upstream.status });
}
