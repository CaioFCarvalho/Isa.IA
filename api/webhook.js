export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Somente POST é permitido' });
  }

  const body = req.body;

  const message = body?.message?.text;
  const sender = body?.message?.from;

  if (!message || !sender) {
    return res.status(400).json({ error: 'Faltando mensagem ou remetente' });
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
          content: "Você é a ISA, atendente virtual da BWR. Responda como um humano muito educado, sem usar gírias, sem emojis, e sempre que usar termos técnicos explique entre parênteses. Nunca diga que você é uma IA."
        },
        {
          role: "user",
          content: message
        }
      ]
    })
  });

  const openaiData = await openaiRes.json();
  const reply = openaiData.choices?.[0]?.message?.content || "Desculpe, tive um problema para entender. Pode repetir?";

  const zapiUrl = "https://api.z-api.io/instances/3E43E8DD1D9DC08F239A669115FAC68F/token/77B09F787B096B72BF713C32/send-text";

  await fetch(zapiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: sender,
      message: reply
    })
  });

  return res.status(200).json({ status: "Respondido com sucesso" });
}
