const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json" } });

const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // ohne I,O,0,1,L (verwechselbar)
function makeCode() {
  let s = "";
  for (let i = 0; i < 4; i++) s += ALPHA[Math.floor(Math.random() * ALPHA.length)];
  return s;
}

// POST /api/create  -> neues Match, Ersteller = Marc-KI (X)
export async function onRequestPost({ env }) {
  let code;
  for (let i = 0; i < 6; i++) {
    code = makeCode();
    if (!(await env.ROOMS.get("room:" + code))) break;
  }
  const room = {
    code,
    game: "ttt",
    board: Array(9).fill(""),
    turn: "X",
    players: { X: true, O: false },
    winner: null,
    winLine: [],
    score: { marc: 0, martin: 0, draw: 0 },
    moves: [],
    created: Date.now(),
    updated: Date.now(),
  };
  await env.ROOMS.put("room:" + code, JSON.stringify(room), { expirationTtl: 86400 });
  return json({ ok: true, room });
}
