import { forwardAdminUsers } from "@/lib/admin-users-server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forwardAdminUsers("PATCH", id, request);
}
