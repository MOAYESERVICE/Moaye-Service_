import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/server-auth";

const apiBaseUrl = (process.env.MOAYE_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

export async function forwardAdminUsers(method: "GET" | "PATCH", id?: string, request?: Request) {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "Session absente. Connectez-vous à nouveau." }, { status: 401 });
  }

  let body: string | undefined;
  if (method === "PATCH") {
    try {
      body = JSON.stringify(await request?.json());
    } catch {
      return NextResponse.json({ success: false, message: "Modification utilisateur invalide." }, { status: 400 });
    }
  }

  const path = id ? `/users/${encodeURIComponent(id)}` : "/users";
  try {
    const upstream = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body } : {}),
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => ({ success: false, message: "Réponse invalide du service utilisateurs." }));
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json({ success: false, message: "Le service utilisateurs est indisponible." }, { status: 503 });
  }
}
