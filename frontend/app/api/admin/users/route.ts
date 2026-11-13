import { forwardAdminUsers } from "@/lib/admin-users-server";

export async function GET() {
  return forwardAdminUsers("GET");
}
