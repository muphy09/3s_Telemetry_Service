import pg from "pg";

const {
  POSTGRES_URL,          // full connection string: postgres://user:pass@host:port/db
  POSTGRES_SSL = "true"  // Supabase requires SSL
} = process.env;

if (!POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL env var");
}

const pool = new pg.Pool({
  connectionString: POSTGRES_URL,
  ssl: POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  max: 3 // serverless-friendly
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
