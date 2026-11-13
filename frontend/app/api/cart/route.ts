import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/server-auth";

const apiBaseUrl = (
  process.env.MOAYE_API_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");

// Synchronise le panier local avec le panier de l'utilisateur connecté.
export async function PUT(request: Request) {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Connectez-vous pour enregistrer votre panier." },
      { status: 401 },
    );
  }

  let body: { items?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Données du panier invalides." },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(body.items) ||
    body.items.length > 100 ||
    body.items.some((item) =>
      !item ||
      typeof item !== "object" ||
      !Number.isSafeInteger(item.productId) ||
      item.productId < 1 ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 999
    )
  ) {
    return NextResponse.json(
      { success: false, message: "Articles du panier invalides." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${apiBaseUrl}/cart`, {
      method: "PUT",
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
      { success: false, message: "Le service du panier est indisponible." },
      { status: 503 },
    );
  }
}
