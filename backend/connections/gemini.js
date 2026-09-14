const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat model — free-form (uses JSON in prompt instructions)
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 2048,
    responseMimeType: "application/json",
  },
});

module.exports = model;
