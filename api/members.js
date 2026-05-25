import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { workspace_id } = req.query;
  if (!workspace_id) return res.status(400).json({ error: 'workspace_id required' });

  try {
    const sql = neon(process.env.DATABASE_URL);
    const members = await sql`
      SELECT user_id, display_name, real_name, title, avatar, is_bot
      FROM workspace_members
      WHERE workspace_id = ${workspace_id} AND is_bot = false
      ORDER BY real_name ASC
    `;
    return res.status(200).json({ members });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
