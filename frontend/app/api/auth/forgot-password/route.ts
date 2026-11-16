import { forwardPasswordRecovery } from "@/lib/server-auth";

export async function POST(request: Request) {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Adresse e-mail invalide." }, { status: 400 });
  }

  if (typeof body.email !== "string") {
    return Response.json({ success: false, message: "Adresse e-mail invalide." }, { status: 400 });
  }

  return forwardPasswordRecovery("forgot-password", { email: body.email });
}
