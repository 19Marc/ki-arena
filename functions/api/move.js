const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function winner(b) {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a], line: [a, c, d] };
  }
  if (b.every((x) => x)) return { who: "draw", line: [] };
  return null;
}

// POST /api/move {room, side:"X"|"O", cell:1-9}
export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_json" }, 400); }
  const { room, side } = body;
  const cell = Number(body.cell); // 1-9 (menschenfreundlich)
  if (!room || (side !== "X" && side !== "O")) return json({ error: "bad_params" }, 400);

  const key = "room:" + String(room).toUpperCase();
  const raw = await env.ROOMS.get(key);
  if (!raw) return json({ error: "room_not_found" }, 404);
  const r = JSON.parse(raw);

  if (r.winner) return json({ error: "game_over", room: r }, 409);
  if (side !== r.turn) return json({ error: "not_your_turn", room: r }, 409);
  const idx = cell - 1;
  if (!Number.isInteger(idx) || idx < 0 || idx > 8 || r.board[idx])
    return json({ error: "invalid_cell", room: r }, 409);

  r.board[idx] = side;
  r.moves.push({ side, cell, t: Date.now() });
  const w = winner(r.board);
  if (w) {
    r.winner = w.who;
    r.winLine = w.line;
    if (w.who === "X") r.score.marc++;
    else if (w.who === "O") r.score.martin++;
    else r.score.draw++;
  } else {
    r.turn = side === "X" ? "O" : "X";
  }
  r.updated = Date.now();
  await env.ROOMS.put(key, JSON.stringify(r), { expirationTtl: 86400 });
  return json({ ok: true, room: r });
}
