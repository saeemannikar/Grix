export const config = { runtime: 'edge' };

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  const { message } = await req.json();
  if (!message?.trim()) return new Response(JSON.stringify({ error: 'No message' }), { status: 400, headers });

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
- null: casual chat, greetings, or no actionable content`;

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 120,
      }),
    });

    const data = await response.json();
    const raw  = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return new Response(JSON.stringify({ error: 'Empty response' }), { status: 500, headers });

    const clean  = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return new Response(JSON.stringify(parsed), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
