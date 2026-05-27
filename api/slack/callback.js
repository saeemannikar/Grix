import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect('/?install=cancelled');
  }

  try {
    // Exchange code for token
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code,
        redirect_uri:  `${process.env.APP_URL}/api/slack/callback`,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('[oauth] Slack error:', data.error);
      return res.redirect('/?install=error');
    }

    // Store workspace tokens in Neon
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      INSERT INTO workspaces (workspace_id, workspace_name, bot_token, bot_user_id, authed_user_id)
      VALUES (
        ${data.team.id},
        ${data.team.name},
        ${data.access_token},
        ${data.bot_user_id ?? null},
        ${data.authed_user?.id ?? null}
      )
      ON CONFLICT (workspace_id) DO UPDATE SET
        bot_token      = EXCLUDED.bot_token,
        workspace_name = EXCLUDED.workspace_name,
        installed_at   = NOW()
    `;

    console.log(`[oauth] Installed for workspace: ${data.team.name} (${data.team.id})`);
    return res.redirect('/?install=success');

  } catch (err) {
    console.error('[oauth] Error:', err.message);
    return res.redirect('/?install=error');
  }
}
