import { NextResponse } from "next/server";
import { forwardAdminHomepage } from "@/lib/admin-homepage-server";

type RouteContext = { params: Promise<{ productKey: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const { productKey } = await params;
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(productKey)) {
    return NextResponse.json({ success: false, message: "Identifiant de carte invalide." }, { status: 400 });
  }
  return forwardAdminHomepage(request, "PUT", productKey);
}
