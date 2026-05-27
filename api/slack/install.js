export default function handler(req, res) {
  const scopes = [
    'chat:write',
    'im:write',
    'im:history',
    'users:read',
    'channels:history',
    'groups:history',
    'commands',
  ].join(',');

  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID,
    scope: scopes,
    redirect_uri: `${process.env.APP_URL}/api/slack/callback`,
  });

  res.redirect(`https://slack.com/oauth/v2/authorize?${params}`);
}
