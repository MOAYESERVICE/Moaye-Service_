import { NextResponse } from "next/server";
import { forwardAdminProduct } from "@/lib/admin-products-server";

type RouteContext = { params: Promise<{ id: string }> };

async function getValidId(params: RouteContext["params"]) {
  const { id } = await params;
  return /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id)) ? id : null;
}

export async function PUT(request: Request, { params }: RouteContext) {
  const id = await getValidId(params);
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Identifiant de produit invalide." },
      { status: 400 },
    );
  }
  return forwardAdminProduct(request, "PUT", id);
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const id = await getValidId(params);
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Identifiant de produit invalide." },
      { status: 400 },
    );
  }
  return forwardAdminProduct(request, "DELETE", id);
}
