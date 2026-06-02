const VIDEO_ROUTES = {
  "/videos/big-bang-x-juliard-v02.mp4": "Big Bang x Juliard V02.mp4",
  "/videos/danse-reel-v01-insta-2.mp4": "DANSE REEL V01_INSTA 2.mp4",
  "/videos/en-boucle-x-pilot-ep-01.mov": "En Boucle x Pilot Ep 01.mov",
  "/videos/la-recette-x-juliard.mp4": "La recette x Juliard.mp4",
  "/videos/magic-candy-v01.mp4": "MAGIC CANDY_V01.mp4",
  "/videos/new-year-2026.mp4": "NEW YEAR 2026.mp4",
  "/videos/reel-generatif-martin.mp4": "REEL_GENERATIF_MARTIN.mp4",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Range, Content-Type",
};

function parseRange(rangeHeader, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader || "");
  if (!match) return null;

  const [, rawStart, rawEnd] = match;
  if (!rawStart && !rawEnd) return null;

  let start = rawStart ? Number(rawStart) : 0;
  let end = rawEnd ? Number(rawEnd) : size - 1;

  if (!rawStart) {
    const suffixLength = Number(rawEnd);
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  }

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start < 0 || end < start || start >= size) return null;

  return {
    offset: start,
    end: Math.min(end, size - 1),
  };
}

function mediaHeaders(object, size) {
  return new Headers({
    ...corsHeaders,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": object?.httpMetadata?.contentType || "video/mp4",
    "Content-Length": String(size),
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const key = VIDEO_ROUTES[url.pathname];

    if (!key) {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    const head = await env.MEDIA_BUCKET.head(key);
    if (!head) {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    const range = parseRange(request.headers.get("Range"), head.size);
    if (range) {
      const length = range.end - range.offset + 1;
      const object = await env.MEDIA_BUCKET.get(key, {
        range: { offset: range.offset, length },
      });
      const headers = mediaHeaders(head, length);
      headers.set("Content-Range", `bytes ${range.offset}-${range.end}/${head.size}`);
      return new Response(request.method === "HEAD" ? null : object.body, {
        status: 206,
        headers,
      });
    }

    const headers = mediaHeaders(head, head.size);
    if (request.method === "HEAD") {
      return new Response(null, { headers });
    }

    const object = await env.MEDIA_BUCKET.get(key);
    return new Response(object.body, { headers });
  },
};
