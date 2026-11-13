import { forwardAdminHomepage } from "@/lib/admin-homepage-server";

export async function GET(request: Request) {
  return forwardAdminHomepage(request, "GET");
}
