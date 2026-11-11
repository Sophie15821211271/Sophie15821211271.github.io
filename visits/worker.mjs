const localDate = now => new Intl.DateTimeFormat("sv-SE", {timeZone:"Asia/Shanghai"}).format(now);
const sessionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default {
  async fetch(request, env) {
    if (request.headers.get("Origin") !== env.SITE_ORIGIN) return new Response(null, {status:403});
    const headers = {
      "Access-Control-Allow-Origin": env.SITE_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
      Vary: "Origin"
    };
    if (request.method === "OPTIONS") return new Response(null, {status:204, headers});
    if (request.method !== "POST") return new Response(null, {status:405, headers});
    const session = await request.text();
    if (!sessionPattern.test(session)) return new Response(null, {status:400, headers});

    const today = localDate(new Date());
    try {
      const [, count, days] = await env.VISITS.batch([
        env.VISITS.prepare("INSERT OR IGNORE INTO sessions(id, day) VALUES (?, ?)").bind(session, today),
        env.VISITS.prepare("SELECT total FROM totals WHERE id = 1"),
        env.VISITS.prepare("SELECT day, visits FROM daily WHERE day BETWEEN ? AND ?").bind(today.slice(0, 7) + "-01", today)
      ]);
      return Response.json({
        today, total: count.results[0].total,
        days: Object.fromEntries(days.results.map(row => [row.day,row.visits]))
      }, {headers});
    } catch {
      return new Response(null, {status:503, headers});
    }
  }
};
