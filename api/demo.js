export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'No message provided' });

  const prompt = `You are an extraction engine for a team communication tool.

Analyze this message and extract actionable content.

Message: "${message.replace(/"/g, "'")}"

Reply with a JSON object only — no markdown, no explanation:
{
  "type": "decision" | "task" | "blocker" | "approval" | "decision_change" | null,
  "title": "concise one-line summary (or null)",
  "owner": "person's first name if someone is assigned (or null)",
  "due_date": "YYYY-MM-DD if a deadline is mentioned (or null)",
  "priority": "high" | "medium" | "low"
}

Rules:
- "decision": something was agreed, settled, or chosen — even implicitly ("yeah red is good" = decision)
- "task": someone needs to do something
- "blocker": something is blocked, waiting, or stuck
- "approval": something needs sign-off or was approved
- "decision_change": a previous decision is being reversed or contradicted
- null: casual chat, greetings, or questions with no actionable content`;

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-small-4-119b-2603',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    const raw  = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return res.status(500).json({ error: 'Empty response from model' });

    const clean  = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('[api/demo]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
