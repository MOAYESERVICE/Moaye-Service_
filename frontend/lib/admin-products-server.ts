import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/server-auth";

const apiBaseUrl = (
  process.env.MOAYE_API_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");

// Le cookie HttpOnly reste côté serveur; le backend garde la décision d'autorisation.
export async function forwardAdminProduct(
  request: Request,
  method: "POST" | "PUT" | "DELETE",
  id?: string,
) {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Session d’administration absente ou expirée. Reconnectez-vous, puis réessayez." },
      { status: 401 },
    );
  }

  let body: string | undefined;
  if (method !== "DELETE") {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Données produit invalides." },
        { status: 400 },
      );
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json(
        { success: false, message: "Données produit invalides." },
        { status: 400 },
      );
    }
    body = JSON.stringify(payload);
  }

  const path = id ? `/products/${encodeURIComponent(id)}` : "/products";
  let upstream: Response;
  try {
    upstream = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Le service produit est indisponible." },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await upstream.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Réponse invalide du backend." },
      { status: 502 },
    );
  }

  return NextResponse.json(payload, { status: upstream.status });
}

// Transmet une photo au backend avec le jeton d'administration conservé en cookie.
export async function forwardAdminProductImage(request: Request) {
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Session d’administration absente ou expirée. Reconnectez-vous, puis réessayez." },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, message: "Fichier image invalide." },
      { status: 400 },
    );
  }

  const image = formData.get("image");
  if (!(image instanceof File)) {
    return NextResponse.json(
      { success: false, message: "Sélectionnez une image." },
      { status: 400 },
    );
  }

  const backendForm = new FormData();
  backendForm.set("image", image, image.name);

  let upstream: Response;
  try {
    upstream = await fetch(`${apiBaseUrl}/products/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: backendForm,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Le service de téléversement est indisponible." },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await upstream.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Réponse invalide du backend." },
      { status: 502 },
    );
  }

  return NextResponse.json(payload, { status: upstream.status });
}
