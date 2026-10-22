/**
 * Round 5 (P1) + GSC fix: canonicalisation — every www./http variant 301s
 * straight to the final https-apex URL *with* trailing slash, so no hop is
 * wasted on a separate trailing-slash redirect and Googlebot sees at most
 * one redirect hop after CF's automatic https upgrade. Assets (paths with a
 * file extension) are redirected without a slash appended.
 */
type EventContextLike = {
  request: Request;
  next: () => Promise<Response>;
};

const CANONICAL_HOST = "lagoslifeguide.app";

function withSlash(pathname: string): string {
  const last = pathname.split("/").pop() ?? "";
  if (last.includes(".")) return pathname; // file asset — keep as-is
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export const onRequest = async ({ request, next }: EventContextLike) => {
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const isWww = url.hostname.startsWith("www.");
  if (isWww || proto === "http") {
    const target = `https://${CANONICAL_HOST}${withSlash(url.pathname)}${url.search}`;
    return Response.redirect(target, 301);
  }
  return next();
};
