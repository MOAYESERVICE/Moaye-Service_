import { forwardAuth } from "@/lib/server-auth";

export async function POST(request: Request) {
  let body: { email?: unknown; currentPassword?: unknown; newPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Données de changement de mot de passe invalides." }, { status: 400 });
  }

  if (
    typeof body.email !== "string" ||
    typeof body.currentPassword !== "string" ||
    typeof body.newPassword !== "string"
  ) {
    return Response.json({ success: false, message: "Données de changement de mot de passe invalides." }, { status: 400 });
  }

  return forwardAuth("change-password", {
    email: body.email,
    currentPassword: body.currentPassword,
    newPassword: body.newPassword,
  });
}
