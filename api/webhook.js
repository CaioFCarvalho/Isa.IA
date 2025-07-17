import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Somente POST permitido' });
  }

  const data = req.body;
  const message = data?.data?.message?.text;
  const sender = data?.data?.sender;

  if (!message || !sender) {
    return res.status(400).json({ error: 'Mensagem ou remetente ausente' });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é a ISA, atendente da BWR. Fale como um humano educado, sem gírias ou emojis. Sempre explique termos técnicos entre parênteses."
        },
        {
          role: "user",
          content: message
        }
      ]
    })
  });

  const openaiData = await openaiRes.json();
  const reply = openaiData.choices?.[0]?.message?.content || "Desculpe, tive um problema. Pode repetir?";

  await fetch("https://api.z-api.io/instances/3E43E8DD1D9DC08F239A669115FAC68F/token/77B09F787B096B72BF713C32/send-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: sender,
      message: reply
    })
  });

  return res.status(200).json({ status: 'Respondido com sucesso' });
}
