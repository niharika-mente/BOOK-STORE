const router = require("express").Router();
const Book = require("../models/book");
const model = require("../connections/gemini");

// Build the book catalog context string for Gemini
async function getCatalogContext() {
  const books = await Book.find()
    .select("_id title author price language desc url")
    .lean();
  return books;
}

// Format catalog for the system prompt
function formatCatalog(books) {
  return books
    .map(
      (b) =>
        `ID:${b._id} | "${b.title}" by ${b.author} | ₹${b.price} | ${b.language} | ${b.desc?.substring(0, 120) || "No description"}`
    )
    .join("\n");
}

// ──────────────────────────────────────────────
// POST /ai/chat — Chatbot with inline book recs
// ──────────────────────────────────────────────
router.post("/ai/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        reply:
          "I'm currently unavailable because the AI service isn't configured. Please try again later!",
        books: [],
        followUp: null,
      });
    }

    // Fetch the full catalog
    const catalog = await getCatalogContext();
    const catalogStr = formatCatalog(catalog);

    // Build the system prompt
    const systemPrompt = `You are "BookVerse AI", a friendly book assistant for the BookVerse online bookstore.

RULES:
1. Only recommend books from the CATALOG below. Never invent books.
2. Reference books by their exact MongoDB _id from the catalog.
3. Be warm and concise — keep "text" to 2-3 sentences MAX.
4. If asked about non-book topics, politely redirect to books.

CATALOG:
${catalogStr}

You MUST respond with this exact JSON structure:
{"text": "Brief response (2-3 sentences)", "recommendedBookIds": ["id1", "id2"], "followUp": "A short follow-up question"}

- recommendedBookIds: array of MongoDB _id strings from the catalog (max 4). Empty array if no recommendation needed.
- followUp: always include a short follow-up question.`;

    // Build chat history for context continuity
    const chatHistory = [];
    if (history && Array.isArray(history)) {
      // Include last 10 messages for context
      const recent = history.slice(-10);
      for (const msg of recent) {
        chatHistory.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Start chat with Gemini
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        {
          role: "model",
          parts: [
            {
              text: JSON.stringify({
                text: "Hi! I'm BookVerse AI, your personal book assistant! 📚 I know everything about the books in our store. Ask me anything — I can recommend books, tell you about specific titles, or help you find the perfect read!",
                recommendedBookIds: [],
                followUp:
                  "What kind of books are you in the mood for today?",
              }),
            },
          ],
        },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text().trim();

    // Parse the JSON response from Gemini
    let parsed;
    try {
      // Strip markdown code fences if Gemini adds them
      const cleaned = responseText
        .replace(/^```json?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If parsing fails, treat the whole response as text
      parsed = {
        text: responseText,
        recommendedBookIds: [],
        followUp: null,
      };
    }

    // Enrich recommended books with full data
    let books = [];
    if (
      parsed.recommendedBookIds &&
      parsed.recommendedBookIds.length > 0
    ) {
      const bookIds = parsed.recommendedBookIds.slice(0, 6); // Max 6 cards
      books = await Book.find({ _id: { $in: bookIds } })
        .select("_id title author price url")
        .lean();
    }

    return res.status(200).json({
      reply: parsed.text || "I couldn't generate a response. Please try again!",
      books: books,
      followUp: parsed.followUp || null,
    });
  } catch (error) {
    console.error("AI Chat Error:", error.message);
    return res.status(200).json({
      reply:
        "Oops! I ran into a hiccup. Please try again in a moment. 😊",
      books: [],
      followUp: "Could you rephrase your question?",
    });
  }
});

// ──────────────────────────────────────────────────
// POST /ai/recommendations — Home page recommendations
// ──────────────────────────────────────────────────
router.post("/ai/recommendations", async (req, res) => {
  try {
    const { preferences, favouriteIds } = req.body;

    const catalog = await getCatalogContext();

    if (!process.env.GEMINI_API_KEY || catalog.length === 0) {
      // Fallback: return 4 most recent books
      const fallback = catalog.slice(0, 4).map((b) => ({
        book: b,
        reason: "Popular in our store",
      }));
      return res.status(200).json({ recommendations: fallback });
    }

    const catalogStr = formatCatalog(catalog);

    // Build user context
    let userContext = "";
    if (favouriteIds && favouriteIds.length > 0) {
      const favBooks = await Book.find({ _id: { $in: favouriteIds } })
        .select("title author language")
        .lean();
      if (favBooks.length > 0) {
        userContext = `\nUser's favourite books: ${favBooks.map((b) => `"${b.title}" by ${b.author} (${b.language})`).join(", ")}`;
      }
    }
    if (preferences) {
      userContext += `\nUser's stated preferences: "${preferences}"`;
    }

    const prompt = `You are a book recommendation engine for BookVerse store.

CATALOG:
${catalogStr}
${userContext || "\nNo specific user preferences available — recommend broadly appealing popular books."}

Pick the best 4 books to recommend from the catalog. Respond with valid JSON only (no markdown fences):
{
  "recommendations": [
    { "bookId": "mongoId", "reason": "Short 1-sentence reason why this book is recommended" }
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    let parsed;
    try {
      const cleaned = responseText
        .replace(/^```json?\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback
      const fallback = catalog.slice(0, 4).map((b) => ({
        book: b,
        reason: "Popular in our store",
      }));
      return res.status(200).json({ recommendations: fallback });
    }

    // Enrich with full book data
    if (parsed.recommendations && parsed.recommendations.length > 0) {
      const ids = parsed.recommendations.map((r) => r.bookId);
      const books = await Book.find({ _id: { $in: ids } })
        .select("_id title author price url language")
        .lean();

      const bookMap = {};
      books.forEach((b) => {
        bookMap[b._id.toString()] = b;
      });

      const enriched = parsed.recommendations
        .filter((r) => bookMap[r.bookId])
        .map((r) => ({
          book: bookMap[r.bookId],
          reason: r.reason,
        }));

      return res.status(200).json({ recommendations: enriched });
    }

    // Fallback
    const fallback = catalog.slice(0, 4).map((b) => ({
      book: b,
      reason: "Popular in our store",
    }));
    return res.status(200).json({ recommendations: fallback });
  } catch (error) {
    console.error("AI Recommendations Error:", error.message);
    try {
      const fallback = await Book.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .select("_id title author price url language")
        .lean();
      return res.status(200).json({
        recommendations: fallback.map((b) => ({
          book: b,
          reason: "Recently added to our collection",
        })),
      });
    } catch {
      return res.status(200).json({ recommendations: [] });
    }
  }
});

module.exports = router;
