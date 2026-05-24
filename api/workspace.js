import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { workspace_id } = req.query;
  if (!workspace_id) return res.status(400).json({ error: 'workspace_id required' });
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT workspace_name AS name FROM workspaces WHERE workspace_id = ${workspace_id}`;
    return res.status(200).json(rows[0] ?? {});
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}