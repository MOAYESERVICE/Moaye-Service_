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
    const upstream = await fetch(`${apiBaseUrl}/contact`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => ({
      success: false,
      message: "Réponse invalide du service des messages.",
    }));
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Le service des messages est indisponible." },
      { status: 503 },
    );
  }
}

// Le formulaire public et l'admin passent par le même serveur API/base de données.
export async function POST(request: Request) {
  const token = (await cookies()).get(sessionCookieName)?.value;
  let body: string;
  try {
    body = JSON.stringify(await request.json());
  } catch {
    return NextResponse.json(
      { success: false, message: "Données du message invalides." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${apiBaseUrl}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => ({
      success: false,
      message: "Réponse invalide du service des messages.",
    }));
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Le service des messages est indisponible." },
      { status: 503 },
    );
  }
}
