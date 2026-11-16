import { NextResponse } from "next/server";
import { forwardAdminRealisations } from "@/lib/admin-realisations-server";

type RouteContext = { params: Promise<{ photoId: string }> };

export async function DELETE(request: Request, { params }: RouteContext) {
  const { photoId } = await params;
  if (!/^[1-9]\d*$/.test(photoId) || !Number.isSafeInteger(Number(photoId))) {
    return NextResponse.json({ success: false, message: "Identifiant de photo invalide." }, { status: 400 });
  }
  return forwardAdminRealisations(request, "DELETE", photoId, "photos");
}
