import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/server-auth";

const apiBaseUrl = (
  process.env.MOAYE_API_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");

// Relaye les commandes du client et leur création avec la session HttpOnly.
export async function GET() {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Connectez-vous pour consulter vos commandes." },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(`${apiBaseUrl}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({ success: false, message: "Réponse invalide du backend." }));
    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Le service de commande est indisponible." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Connectez-vous pour passer une commande." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Données de commande invalides." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${apiBaseUrl}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({
      success: false,
      message: "Réponse invalide du backend.",
    }));

    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Le service de commande est indisponible." },
      { status: 503 },
    );
  }
}
