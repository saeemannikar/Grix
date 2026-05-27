import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { type, days = 30, limit = 100, workspace_id } = req.query;
    const since = new Date(Date.now() - days * 86400_000).toISOString();

    // workspace_id filter — required for security
    if (!workspace_id) return res.status(400).json({ error: 'workspace_id required' });

    let rows;
    if (type && type !== 'all') {
      rows = await sql`
        SELECT id, type, title, owner, due_date, priority, source_location, created_at
        FROM extractions
        WHERE workspace_id = ${workspace_id} AND type = ${type} AND created_at >= ${since}
        ORDER BY created_at DESC LIMIT ${parseInt(limit)}
      `;
    } else {
      rows = await sql`
        SELECT id, type, title, owner, due_date, priority, source_location, created_at
        FROM extractions
        WHERE workspace_id = ${workspace_id} AND created_at >= ${since}
        ORDER BY created_at DESC LIMIT ${parseInt(limit)}
      `;
    }

    const stats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE type = 'decision')        AS decisions,
        COUNT(*) FILTER (WHERE type = 'task')            AS tasks,
        COUNT(*) FILTER (WHERE type = 'blocker')         AS blockers,
        COUNT(*) FILTER (WHERE type = 'approval')        AS approvals,
        COUNT(*) FILTER (WHERE type = 'decision_change') AS decision_changes,
        COUNT(*)                                          AS total
      FROM extractions
      WHERE workspace_id = ${workspace_id} AND created_at >= ${since}
    `;

    return res.status(200).json({ rows, stats: stats[0] });
  } catch (err) {
    console.error('[api/extractions]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
