import { forwardAuth } from "@/lib/server-auth";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Données de connexion invalides." }, { status: 400 });
  }

  if (typeof body.email !== "string" || typeof body.password !== "string") {
    return Response.json({ success: false, message: "Données de connexion invalides." }, { status: 400 });
  }
  return forwardAuth("login", { email: body.email, password: body.password });
}
