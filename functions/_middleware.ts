/**
 * Round 5 (P1): canonicalisation — every www./http variant 301s to the
 * https apex, so GSC stops seeing split signals for the same pages.
 * Runs as a Cloudflare Pages Function on every request.
 */
type EventContextLike = {
  request: Request;
  next: () => Promise<Response>;
};

export const onRequest = async ({ request, next }: EventContextLike) => {
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  if (url.hostname.startsWith("www.") || proto === "http") {
    const target = `https://lagoslifeguide.app${url.pathname}${url.search}`;
    return Response.redirect(target, 301);
  }
  return next();
};
