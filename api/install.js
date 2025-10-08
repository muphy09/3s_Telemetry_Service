import { query } from "../lib/db.js";

const REQUIRED_TOKEN = process.env.TELEMETRY_TOKEN;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!REQUIRED_TOKEN) return res.status(500).json({ error: "Server missing token" });
  if (req.headers.authorization !== `Bearer ${REQUIRED_TOKEN}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let body = req.body;
  if (!body || typeof body !== "object") {
    try { body = JSON.parse(req.body || "{}"); } catch {}
  }

  const { userId, appVersion, os } = body || {};
  if (!userId || !appVersion || !os) {
    return res.status(400).json({ error: "Missing fields: userId, appVersion, os" });
  }

  await query(
  `
  insert into installs (user_id, app_version, os, first_seen, last_seen)
  values ($1, $2, $3, now(), now())
  on conflict (user_id)
  do update set 
    app_version = excluded.app_version,
    os = excluded.os,
    last_seen = excluded.last_seen
  `,
  [userId, appVersion, os]
);

  return res.json({ ok: true });
}
