import { forwardAdminProduct } from "@/lib/admin-products-server";

export async function POST(request: Request) {
  return forwardAdminProduct(request, "POST");
}
