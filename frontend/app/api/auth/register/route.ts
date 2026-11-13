import { forwardAuth } from "@/lib/server-auth";

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; phone?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Données d’inscription invalides." }, { status: 400 });
  }

  if (
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    typeof body.phone !== "string" ||
    typeof body.password !== "string"
  ) {
    return Response.json({ success: false, message: "Données d’inscription invalides." }, { status: 400 });
  }
  return forwardAuth("register", { name: body.name, email: body.email, phone: body.phone, password: body.password });
}
