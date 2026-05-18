const { neon } = require('@neondatabase/serverless');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { type, days = 30, limit = 50 } = req.query;
    const since = new Date(Date.now() - days * 86400_000).toISOString();

    let rows;
    if (type && type !== 'all') {
      rows = await sql`
        select id, type, title, owner, due_date, priority, confidence, source_location, created_at
        from extractions
        where created_at >= ${since}
          and type = ${type}
        order by created_at desc
        limit ${parseInt(limit)}
      `;
    } else {
      rows = await sql`
        select id, type, title, owner, due_date, priority, confidence, source_location, created_at
        from extractions
        where created_at >= ${since}
        order by created_at desc
        limit ${parseInt(limit)}
      `;
    }

    // Stats
    const stats = await sql`
      select
        count(*) filter (where type = 'decision') as decisions,
        count(*) filter (where type = 'task')     as tasks,
        count(*) filter (where type = 'blocker')  as blockers,
        count(*) filter (where type = 'approval') as approvals,
        count(*)                                   as total
      from extractions
      where created_at >= ${since}
    `;

    return res.status(200).json({ rows, stats: stats[0] });
  } catch (err) {
    console.error('[api/extractions]', err.message);
    return res.status(500).json({ error: err.message });
  }
}