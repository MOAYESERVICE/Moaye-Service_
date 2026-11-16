import { forwardPasswordRecovery } from "@/lib/server-auth";

export async function POST(request: Request) {
  let body: { email?: unknown; code?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Données de réinitialisation invalides." }, { status: 400 });
  }

  if (typeof body.email !== "string" || typeof body.code !== "string" || typeof body.password !== "string") {
    return Response.json({ success: false, message: "Données de réinitialisation invalides." }, { status: 400 });
  }

  return forwardPasswordRecovery("reset-password", { email: body.email, code: body.code, password: body.password });
}
