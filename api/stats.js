import { query } from "../lib/db.js";

const REQUIRED_TOKEN = process.env.TELEMETRY_TOKEN;
const READONLY_TOKEN = process.env.TELEMETRY_STATS_TOKEN; // optional separate token

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (!REQUIRED_TOKEN && !READONLY_TOKEN) return res.status(500).json({ error: "Server missing token(s)" });

  const auth = req.headers.authorization || "";
  const ok =
    auth === `Bearer ${READONLY_TOKEN}` ||
    auth === `Bearer ${REQUIRED_TOKEN}`;
  if (!ok) return res.status(401).json({ error: "Unauthorized" });

  const result = await query(
    `
    select os, app_version, count(distinct user_id)::int as unique_users
    from installs
    group by os, app_version
    order by os, app_version;
    `
  );

  return res.json({ rows: result.rows });
}
