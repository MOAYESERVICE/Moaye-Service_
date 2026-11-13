import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/server-auth";

const apiBaseUrl = (
  process.env.MOAYE_API_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");

export async function GET() {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Session absente. Connectez-vous à nouveau." },
      { status: 401 },
    );
  }

  try {
    const upstream = await fetch(`${apiBaseUrl}/orders/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => ({
      success: false,
      message: "Réponse invalide du service des commandes.",
    }));
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Le service des commandes est indisponible." },
      { status: 503 },
    );
  }
}
