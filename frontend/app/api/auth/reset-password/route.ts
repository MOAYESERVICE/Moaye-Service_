import { forwardPasswordRecovery } from "@/lib/server-auth";

export async function POST(request: Request) {
  let body: { token?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Données de réinitialisation invalides." }, { status: 400 });
  }

  if (typeof body.token !== "string" || typeof body.password !== "string") {
    return Response.json({ success: false, message: "Données de réinitialisation invalides." }, { status: 400 });
  }

  return forwardPasswordRecovery("reset-password", { token: body.token, password: body.password });
}
