const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });

// GET /api/state?room=CODE
export async function onRequestGet({ request, env }) {
  const room = new URL(request.url).searchParams.get("room");
  if (!room) return json({ error: "missing_room" }, 400);
  const raw = await env.ROOMS.get("room:" + room.toUpperCase());
  if (!raw) return json({ error: "room_not_found" }, 404);
  return json({ ok: true, room: JSON.parse(raw) });
}
