window.reportMove = async function reportMove(from, to, meta = {}) {
  const body = { from: String(from).toUpperCase(), to: String(to).toUpperCase(), meta };
  const r = await fetch("/api/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};
