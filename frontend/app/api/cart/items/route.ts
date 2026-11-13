import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/server-auth";

const apiBaseUrl = (
  process.env.MOAYE_API_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");

// Transmet un ajout au panier backend en gardant le jeton dans le cookie HttpOnly.
export async function POST(request: Request) {
  const token = (await cookies()).get(sessionCookieName)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Connectez-vous pour enregistrer votre panier." },
      { status: 401 },
    );
  }

  let body: { productId?: unknown; quantity?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Données du panier invalides." },
      { status: 400 },
    );
  }

  const productId = Number(body.productId);
  const quantity = Number(body.quantity);

  if (
    !Number.isSafeInteger(productId) ||
    productId < 1 ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1
  ) {
    return NextResponse.json(
      { success: false, message: "Produit ou quantité invalide." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${apiBaseUrl}/cart/items`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, quantity }),
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
