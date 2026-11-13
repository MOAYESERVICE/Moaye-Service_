import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/server-auth";

const apiBaseUrl = (
  process.env.MOAYE_API_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");

async function forward(request: Request, method: "GET" | "POST") {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (method === "GET" && !token) {
    return NextResponse.json(
      { success: false, message: "Connectez-vous pour consulter les devis." },
      { status: 401 },
    );
  }

  let body: string | undefined;
  if (method === "POST") {
    try {
      body = JSON.stringify(await request.json());
    } catch {
      return NextResponse.json(
        { success: false, message: "Données de devis invalides." },
        { status: 400 },
      );
    }
  }

  try {
    const upstream = await fetch(`${apiBaseUrl}/quotes`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body } : {}),
      cache: "no-store",
    });
    const payload = await upstream.json().catch(() => ({
      success: false,
      message: "Réponse invalide du service des devis.",
    }));
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Le service des devis est indisponible." },
      { status: 503 },
    );
  }
}

export async function GET(request: Request) {
  return forward(request, "GET");
}

export async function POST(request: Request) {
  return forward(request, "POST");
}
