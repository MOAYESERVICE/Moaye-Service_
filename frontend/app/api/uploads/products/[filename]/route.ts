type RouteContext = { params: Promise<{ filename: string }> };

const apiBaseUrl = (
  process.env.MOAYE_API_URL ?? "http://localhost:4000/api"
).replace(/\/+$/, "");
const backendOrigin = apiBaseUrl.replace(/\/api$/, "");

// Sert au frontend les photos conservées sur le disque du backend.
export async function GET(_request: Request, { params }: RouteContext) {
  const { filename } = await params;
  if (!/^[0-9a-f-]{36}\.(png|jpg|webp)$/.test(filename)) {
    return new Response(null, { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${backendOrigin}/uploads/products/${encodeURIComponent(filename)}`,
      { cache: "force-cache" },
    );
  } catch {
    return new Response(null, { status: 503 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(null, { status: 404 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
