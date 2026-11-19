import { forwardAuth } from "@/lib/server-auth";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown; activationCode?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Données d’activation invalides." }, { status: 400 });
  }

  if (
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    typeof body.activationCode !== "string"
  ) {
    return Response.json({ success: false, message: "Données d’activation invalides." }, { status: 400 });
  }

  return forwardAuth("developer-activation", {
    email: body.email,
    password: body.password,
    activationCode: body.activationCode,
  });
}
