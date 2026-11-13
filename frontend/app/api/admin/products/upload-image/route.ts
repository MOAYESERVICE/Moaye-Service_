import { forwardAdminProductImage } from "@/lib/admin-products-server";

export async function POST(request: Request) {
  return forwardAdminProductImage(request);
}
