require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-3.6-flash',
  generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 2048 }
});

async function testChat() {
  try {
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "You are a book assistant. Respond with JSON only." }] },
        { role: "model", parts: [{ text: '{"text": "Hello!", "recommendedBookIds": [], "followUp": "What do you like?"}' }] },
      ],
    });

    console.log("Sending message...");
    const result = await chat.sendMessage("recommend a book");
    console.log("SUCCESS:", result.response.text());
  } catch (e) {
    console.log("ERROR:", e.message);
    console.log("Full error:", JSON.stringify(e, null, 2));
  }
}

testChat();
