import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/server-auth";

const apiBaseUrl = (
  process.env.MOAYE_API_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Session absente. Connectez-vous à nouveau." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { success: false, message: "Référence de devis invalide." },
      { status: 400 },
    );
  }

  let body: string;
  try {
    body = JSON.stringify(await request.json());
  } catch {
    return NextResponse.json(
      { success: false, message: "Données de mise à jour invalides." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${apiBaseUrl}/quotes/${id}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
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
