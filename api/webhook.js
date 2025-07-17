export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const data = req.body;
  const message = data?.data?.message?.text;
  const sender = data?.data?.sender;

  if (!message || !sender) {
    return res.status(400).json({ error: 'Missing message or sender' });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;

  try {
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

    // Enviar resposta para o WhatsApp via Z-API
    const zapiURL = "https://api.z-api.io/instances/3E43E8DD1D9DC08F239A669115FAC68F/token/77B09F787B096B72BF713C32/send-text";

    const zapiResponse = await fetch(zapiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: sender,
        message: reply
      })
    });

    return res.status(200).json({ status: 'Respondido com sucesso' });

  } catch (error) {
    console.error("Erro ao processar o webhook:", error);
    return res.status(500).json({ error: 'Erro interno ao processar mensagem.' });
  }
}
