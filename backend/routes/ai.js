const router = require("express").Router();
const Book = require("../models/book");
const Order = require("../models/order");
const model = require("../connections/gemini");

// Build the book catalog context string for Gemini
async function getCatalogContext() {
  const books = await Book.find()
    .select( "_id title author price language desc url createdAt" )
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

const PREFERENCE_ALIASES = {
  "science fiction": [ "science", "fiction", "sci-fi", "scifi" ],
  fantasy: [ "magic", "magical", "adventure" ],
  romance: [ "romance", "romantic", "love", "relationship" ],
  thriller: [ "thriller", "suspense", "crime", "mystery" ],
  mystery: [ "mystery", "detective", "crime", "suspense" ],
  "self help": [ "self-help", "selfhelp", "habits", "productivity", "motivation" ],
  adventure: [ "adventure", "journey", "travel", "explore" ],
  classic: [ "classic", "literature", "novel" ],
  art: [ "art", "creative", "drawing", "coloring", "mandala" ],
  hindi: [ "hindi" ],
  english: [ "english" ],
};

const PREFERENCE_STOP_WORDS = new Set( [
  "a", "an", "and", "book", "books", "for", "give", "get", "i", "me",
  "more", "of", "recommend", "recommendation", "recommendations", "some",
  "that", "the", "want", "which", "with", "would", "like", "something",
] );

function getPreferenceTerms ( preferences = "" )
{
  const normalized = preferences.toLowerCase().replace( /[₹$]/g, "" );
  const words = normalized
    .split( /[^a-z0-9]+/ )
    .filter( ( word ) => word.length > 2 && !PREFERENCE_STOP_WORDS.has( word ) );
  const phrases = Object.keys( PREFERENCE_ALIASES ).filter( ( phrase ) =>
    normalized.includes( phrase )
  );
  const aliasTerms = phrases.flatMap( ( phrase ) => PREFERENCE_ALIASES[ phrase ] );
  return [ ...new Set( [ ...words, ...phrases, ...aliasTerms ] ) ];
}

function getMaximumPrice ( preferences = "" )
{
  const match = preferences.match( /(?:under|below|less than|within)\s*[₹$]?\s*(\d+)/i );
  return match ? Number( match[ 1 ] ) : null;
}

function buildFallbackRecommendations ( catalog, excludeIds, preferences = "" )
{
  const preferenceTerms = getPreferenceTerms( preferences );
  const maximumPrice = getMaximumPrice( preferences );

  const recentBookIds = new Set(
    [ ...catalog ]
      .sort( ( a, b ) => new Date( b.createdAt || 0 ) - new Date( a.createdAt || 0 ) )
      .slice( 0, 4 )
      .map( ( book ) => book._id.toString() )
  );
  const olderBooks = catalog.filter(
    ( book ) =>
      !excludeIds.has( book._id.toString() ) &&
      !recentBookIds.has( book._id.toString() )
  );
  const availableBooks = ( olderBooks.length >= 4 ? olderBooks : catalog ).filter(
    ( book ) =>
      !excludeIds.has( book._id.toString() ) &&
      ( maximumPrice === null || book.price <= maximumPrice )
  );
  const rankedBooks = availableBooks
    .map( ( book ) =>
    {
      const searchableText = `${ book.title } ${ book.author } ${ book.language } ${ book.desc || "" }`.toLowerCase();
      const preferenceScore = preferenceTerms.reduce(
        ( score, term ) => score + ( searchableText.includes( term ) ? ( term.includes( " " ) ? 3 : 1 ) : 0 ),
        0
      );
      return { book, preferenceScore };
    } )
    .sort( ( a, b ) => b.preferenceScore - a.preferenceScore || Math.random() - 0.5 );

  const selectedBooks = rankedBooks.slice( 0, 4 );
  return selectedBooks.map( ( { book, preferenceScore } ) => ( {
    book,
    reason: maximumPrice !== null && book.price <= maximumPrice
      ? `A good match within your budget of ₹${ maximumPrice }.`
      : preferenceScore > 0
        ? `A good match for your interest in ${ preferences }.`
        : "A fresh pick from our collection.",
  } ) );
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

    const excludeIds = new Set();

    [ favouriteIds, cartIds, orderedBookIds ]
      .filter( Array.isArray )
      .flat()
      .forEach( ( id ) => excludeIds.add( id.toString() ) );

    if ( catalog.length === 0 )
    {
      return res.status( 200 ).json( {
        recommendations: buildFallbackRecommendations( catalog, excludeIds, preferences ),
      } );
    }

    // Keep recommendations available when Gemini is unavailable or rate-limited.
    // The local matcher understands natural descriptions and uses the catalog data.
    return res.status( 200 ).json( {
      recommendations: buildFallbackRecommendations( catalog, excludeIds, preferences ),
    } );

    const catalogStr = formatCatalog(catalog);

    // Build rich user context from all available data
    let userContext = "";
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
      return res.status( 200 ).json( {
        recommendations: buildFallbackRecommendations( catalog, excludeIds, preferences ),
      } );
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
    return res.status( 200 ).json( {
      recommendations: buildFallbackRecommendations( catalog, excludeIds, preferences ),
    } );
  } catch (error) {
    console.error("AI Recommendations Error:", error.message);
    try {
      const fallbackCatalog = await Book.find()
        .select( "_id title author price url language desc createdAt" )
        .lean();
      return res.status(200).json({
        recommendations: buildFallbackRecommendations(
          fallbackCatalog,
          new Set(),
          req.body.preferences
        ),
      });
    } catch {
      return res.status(200).json({ recommendations: [] });
    }
  }
});

module.exports = router;
