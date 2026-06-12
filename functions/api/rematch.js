const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });

// POST /api/rematch {room} -> neues Brett, Score bleibt; Verlierer (bzw. O nach Remis) beginnt
export async function onRequestPost({ request, env }) {
  const { room } = await request.json();
  if (!room) return json({ error: "missing_room" }, 400);
  const key = "room:" + String(room).toUpperCase();
  const raw = await env.ROOMS.get(key);
  if (!raw) return json({ error: "room_not_found" }, 404);
  const r = JSON.parse(raw);
  const starter = r.winner === "X" ? "O" : "X"; // Gewinner gibt Anstoß ab
  r.board = Array(9).fill("");
  r.turn = starter;
  r.winner = null;
  r.winLine = [];
  r.moves = [];
  r.updated = Date.now();
  await env.ROOMS.put(key, JSON.stringify(r), { expirationTtl: 86400 });
  return json({ ok: true, room: r });
}
