// CORS für alle /api-Routen (damit auch ein externes Claude-Code per curl spielen kann)
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  const res = await context.next();
  const out = new Response(res.body, res);
  for (const k in cors) out.headers.set(k, cors[k]);
  return out;
}
