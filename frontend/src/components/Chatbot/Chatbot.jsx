import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../api";
import { BsChatDotsFill } from "react-icons/bs";
import { IoClose, IoSend } from "react-icons/io5";
import { HiSparkles } from "react-icons/hi2";
import { FiExternalLink } from "react-icons/fi";
import "./Chatbot.css";

const SUGGESTIONS = [
  "📚 Recommend a book",
  "🔥 What's trending?",
  "💰 Books under ₹500",
  "📖 Tell me about a book",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage || isLoading) return;

    // Add user message
    const updatedMessages = [
      ...messages,
      { role: "user", content: userMessage, books: [] },
    ];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Build history for context (last 10 messages, text only)
      const history = updatedMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await axios.post(`${BASE_URL}/ai/chat`, {
        message: userMessage,
        history,
      });

      const { reply, books, followUp } = response.data;

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: reply,
          books: books || [],
          followUp: followUp || null,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again in a moment! 😊",
          books: [],
          followUp: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (text) => {
    sendMessage(text);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          className="chatbot-fab"
          onClick={() => setIsOpen(true)}
          title="Ask BookVerse AI"
          id="chatbot-fab"
        >
          <BsChatDotsFill />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="chatbot-panel" id="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-header-icon">
                <HiSparkles />
              </div>
              <div className="chatbot-header-text">
                <h3>BookVerse AI</h3>
                <span>Online — Ready to help</span>
              </div>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              title="Close chat"
            >
              <IoClose />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <>
                {/* Welcome Screen */}
                <div className="chatbot-welcome">
                  <div className="chatbot-welcome-icon">
                    <HiSparkles />
                  </div>
                  <h4>Hi! I'm BookVerse AI ✨</h4>
                  <p>
                    Ask me anything about books — I can recommend titles, answer
                    questions, and help you discover your next great read!
                  </p>
                </div>

                {/* Suggestion Chips */}
                <div className="chatbot-suggestions">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      className="chatbot-suggestion-chip"
                      onClick={() => handleSuggestionClick(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`chatbot-msg ${msg.role}`}>
                    <div className="chatbot-msg-bubble">
                      {/* Text Content */}
                      <div>{msg.content}</div>

                      {/* Inline Book Cards */}
                      {msg.books && msg.books.length > 0 && (
                        <div className="chatbot-book-cards">
                          {msg.books.map((book) => (
                            <Link
                              key={book._id}
                              to={`/view-book-details/${book._id}`}
                              className="chatbot-book-card"
                              onClick={() => setIsOpen(false)}
                            >
                              <img
                                src={book.url}
                                alt={book.title}
                                className="chatbot-book-card-img"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/140x100?text=No+Cover";
                                }}
                              />
                              <div className="chatbot-book-card-info">
                                <p className="chatbot-book-card-title">
                                  {book.title}
                                </p>
                                <p className="chatbot-book-card-author">
                                  {book.author}
                                </p>
                                <div className="chatbot-book-card-bottom">
                                  <p className="chatbot-book-card-price">
                                    ₹{book.price}
                                  </p>
                                  <span className="chatbot-book-card-link">
                                    View <FiExternalLink />
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Follow-up suggestion */}
                      {msg.followUp && (
                        <div className="chatbot-followup">
                          💡 {msg.followUp}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Show suggestions after messages too */}
                {!isLoading && messages.length > 0 && (
                  <div className="chatbot-suggestions">
                    {SUGGESTIONS.slice(0, 3).map((s, i) => (
                      <button
                        key={i}
                        className="chatbot-suggestion-chip"
                        onClick={() => handleSuggestionClick(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="chatbot-typing">
                <div className="chatbot-typing-dot"></div>
                <div className="chatbot-typing-dot"></div>
                <div className="chatbot-typing-dot"></div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Ask about books..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              id="chatbot-input"
            />
            <button
              className="chatbot-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              title="Send message"
              id="chatbot-send-btn"
            >
              <IoSend />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
