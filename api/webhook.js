const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const data = req.body;
  const message = data?.data?.message?.text;
  const sender = data?.data?.sender;

  if (!message || !sender) {
    return res.status(400).json({ error: 'Missing message or sender' });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
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

    await fetch("https://api.z-api.io/instances/YOUR_INSTANCE_ID/token/YOUR_INSTANCE_TOKEN/send-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: sender,
        message: reply
      })
    });

    return res.status(200).json({ status: "Respondido com sucesso" });

  } catch (error) {
    console.error("Erro no webhook:", error);
    return res.status(500).json({ error: "Erro interno ao processar a mensagem" });
  }
};
