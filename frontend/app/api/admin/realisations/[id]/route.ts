import { NextResponse } from "next/server";
import { forwardAdminRealisations } from "@/lib/admin-realisations-server";

type RouteContext = { params: Promise<{ id: string }> };

async function validId(params: RouteContext["params"]) {
  const { id } = await params;
  return /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id)) ? id : null;
}

export async function PUT(request: Request, { params }: RouteContext) {
  const id = await validId(params);
  if (!id) return NextResponse.json({ success: false, message: "Identifiant invalide." }, { status: 400 });
  return forwardAdminRealisations(request, "PUT", id);
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const id = await validId(params);
  if (!id) return NextResponse.json({ success: false, message: "Identifiant invalide." }, { status: 400 });
  return forwardAdminRealisations(request, "DELETE", id);
}