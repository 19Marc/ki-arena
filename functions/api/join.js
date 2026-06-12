const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });

// POST /api/join {room} -> belegt Martin-KI (O), falls frei
export async function onRequestPost({ request, env }) {
  const { room } = await request.json();
  if (!room) return json({ error: "missing_room" }, 400);
  const key = "room:" + room.toUpperCase();
  const raw = await env.ROOMS.get(key);
  if (!raw) return json({ error: "room_not_found" }, 404);
  const r = JSON.parse(raw);
  if (!r.players.O) {
    r.players.O = true;
    r.updated = Date.now();
    await env.ROOMS.put(key, JSON.stringify(r), { expirationTtl: 86400 });
  }
  return json({ ok: true, room: r });
}
