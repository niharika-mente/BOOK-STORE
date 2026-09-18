const router = require("express").Router();
const Book = require("../models/book");
const Order = require("../models/order");
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

// Robust JSON extraction from Gemini responses
function parseAIResponse(responseText) {
  // Try direct parse first
  try {
    return JSON.parse(responseText.trim());
  } catch {
    // ignore
  }

  // Strip markdown code fences
  try {
    const cleaned = responseText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    // ignore
  }

  // Try to extract JSON object from the response using regex
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // ignore
  }

  return null;
}

// Helper: retry a Gemini call on transient 503 errors
async function retryGeminiCall ( fn, maxRetries = 2, delayMs = 2000 )
{
  for ( let attempt = 0; attempt <= maxRetries; attempt++ )
  {
    try
    {
      return await fn();
    } catch ( err )
    {
      const is503 = err.message?.includes( "503" ) || err.status === 503;
      if ( is503 && attempt < maxRetries )
      {
        console.log( `Gemini 503 — retrying in ${ delayMs }ms (attempt ${ attempt + 1 }/${ maxRetries })` );
        await new Promise( ( r ) => setTimeout( r, delayMs ) );
        continue;
      }
      throw err;
    }
  }
}

// ──────────────────────────────────────────────
// POST /ai/chat — Chatbot with inline book recs
// ──────────────────────────────────────────────
router.post("/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const normalizedMessage = message.toLowerCase();
    const isBudgetRequest = normalizedMessage.includes( "under ₹500" ) ||
      normalizedMessage.includes( "under 500" ) ||
      normalizedMessage.includes( "below 500" );
    const isTrendingRequest = normalizedMessage.includes( "trending" ) ||
      normalizedMessage.includes( "popular" );
    const isBookDetailsRequest = normalizedMessage.includes( "tell me about" ) ||
      normalizedMessage.includes( "about a book" );

    let query = Book.find().select( "_id title author price url desc language" );
    if ( isBudgetRequest ) query = query.where( "price" ).lte( 500 );
    if ( isTrendingRequest ) query = query.sort( { createdAt: -1 } );
    const books = await query.limit( 4 ).lean();

    let reply = "Here are some books you may enjoy! 📚";
    let followUp = "Would you like recommendations from a particular genre?";

    if ( isBudgetRequest )
    {
      reply = books.length
        ? "Here are great books available for under ₹500! 💰"
        : "I couldn't find any books under ₹500 right now.";
      followUp = "Would you like to see books at another price range?";
    } else if ( isTrendingRequest )
    {
      reply = "Here are the latest popular picks from our collection! 🔥";
      followUp = "Would you like a recommendation by genre?";
    } else if ( isBookDetailsRequest )
    {
      reply = books.length
        ? `Here is a book from our collection: ${ books[ 0 ].title } by ${ books[ 0 ].author }. 📖`
        : "Our book catalog is empty right now. Please check back soon.";
      followUp = "Would you like me to recommend another book?";
    }

    return res.status(200).json({
      reply,
      books: books,
      followUp,
    });
  } catch (error) {
    console.error("AI Chat Error:", error.message);
    return res.status(200).json({
      reply: "I can still help with book suggestions, but the catalog is temporarily unavailable. Please try again shortly.",
      books: [],
      followUp: "Please try one of the suggestions again.",
    });
  }
});

// ──────────────────────────────────────────────────
// POST /ai/recommendations — Home page recommendations
// ──────────────────────────────────────────────────
router.post("/ai/recommendations", async (req, res) => {
  try {
    const { preferences, favouriteIds, cartIds, orderedBookIds } = req.body;

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

    // Build rich user context from all available data
    let userContext = "";
    const excludeIds = new Set();

    // Favourites context
    if (favouriteIds && favouriteIds.length > 0) {
      const favBooks = await Book.find({ _id: { $in: favouriteIds } })
        .select("title author language")
        .lean();
      if (favBooks.length > 0) {
        userContext += `\nUser's FAVOURITE books (they love these): ${favBooks.map((b) => `"${b.title}" by ${b.author} (${b.language})`).join(", ")}`;
        favouriteIds.forEach((id) => excludeIds.add(id.toString()));
      }
    }

    // Cart context
    if (cartIds && cartIds.length > 0) {
      const cartBooks = await Book.find({ _id: { $in: cartIds } })
        .select("title author language")
        .lean();
      if (cartBooks.length > 0) {
        userContext += `\nUser's CART (they intend to buy these): ${cartBooks.map((b) => `"${b.title}" by ${b.author} (${b.language})`).join(", ")}`;
        cartIds.forEach((id) => excludeIds.add(id.toString()));
      }
    }

    // Order history context
    if (orderedBookIds && orderedBookIds.length > 0) {
      const orderedBooks = await Book.find({ _id: { $in: orderedBookIds } })
        .select("title author language")
        .lean();
      if (orderedBooks.length > 0) {
        userContext += `\nUser's PREVIOUSLY ORDERED books (already purchased): ${orderedBooks.map((b) => `"${b.title}" by ${b.author} (${b.language})`).join(", ")}`;
        orderedBookIds.forEach((id) => excludeIds.add(id.toString()));
      }
    }

    // User preferences text
    if (preferences) {
      userContext += `\nUser's stated preferences: "${preferences}"`;
    }

    // Build exclude instruction
    let excludeInstruction = "";
    if (excludeIds.size > 0) {
      excludeInstruction = `\n\nIMPORTANT: Do NOT recommend any of these book IDs (the user already has them): ${[...excludeIds].join(", ")}`;
    }

    const prompt = `You are a book recommendation engine for BookVerse store.

CATALOG:
${catalogStr}
${userContext || "\nNo specific user preferences available — recommend broadly appealing popular books."}
${excludeInstruction}

Pick the best 4 books to recommend from the catalog that the user does NOT already have. Choose books that complement their taste based on their favourites, cart, and order history. Recommend DIFFERENT books from what they already own.

Respond with ONLY a valid JSON object (no markdown code fences, no extra text):
{
  "recommendations": [
    { "bookId": "mongoId", "reason": "Short 1-sentence reason why this book is recommended based on their taste" }
  ]
}`;

    // Generate with retry on 503
    const result = await retryGeminiCall( () => model.generateContent( prompt ) );
    const responseText = result.response.text().trim();

    const parsed = parseAIResponse(responseText);

    if (!parsed || !parsed.recommendations || parsed.recommendations.length === 0) {
      // Fallback: return books NOT in user's collection
      const fallbackBooks = catalog
        .filter((b) => !excludeIds.has(b._id.toString()))
        .slice(0, 4);
      const fallback = (fallbackBooks.length > 0 ? fallbackBooks : catalog.slice(0, 4))
        .map((b) => ({
          book: b,
          reason: "Popular in our store",
        }));
      return res.status(200).json({ recommendations: fallback });
    }

    // Enrich with full book data
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

    if (enriched.length > 0) {
      return res.status(200).json({ recommendations: enriched });
    }

    // Fallback if enrichment found nothing
    const fallbackBooks = catalog
      .filter((b) => !excludeIds.has(b._id.toString()))
      .slice(0, 4);
    const fallback = (fallbackBooks.length > 0 ? fallbackBooks : catalog.slice(0, 4))
      .map((b) => ({
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
          reason: "AI is currently busy — here's a popular pick instead! ✨ (Fallback Mode)",
        })),
      });
    } catch {
      return res.status(200).json({ recommendations: [] });
    }
  }
});

module.exports = router;
