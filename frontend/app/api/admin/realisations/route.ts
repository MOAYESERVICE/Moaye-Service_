import { forwardAdminRealisations } from "@/lib/admin-realisations-server";

export async function GET(request: Request) {
  return forwardAdminRealisations(request, "GET");
}

export async function POST(request: Request) {
  return forwardAdminRealisations(request, "POST");
}