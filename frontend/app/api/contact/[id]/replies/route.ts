import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/server-auth";

const apiBaseUrl = (process.env.MOAYE_API_URL ?? "http://localhost:4000/api").replace(/\/+$/, "");

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return NextResponse.json({ success: false, message: "Connectez-vous pour envoyer une réponse." }, { status: 401 });
  const { id } = await params;
  let body: string;
  try {
    body = JSON.stringify(await request.json());
  } catch {
    return NextResponse.json({ success: false, message: "Message invalide." }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${apiBaseUrl}/contact/${encodeURIComponent(id)}/replies`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => ({ success: false, message: "Réponse invalide du service des messages." }));
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json({ success: false, message: "Le service des messages est indisponible." }, { status: 503 });
  }
}
