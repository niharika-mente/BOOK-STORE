import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import BookCard from "../BookCard/BookCard";
import BASE_URL from "../../api";
import { HiSparkles } from "react-icons/hi2";

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const fetchRecommendations = async (userPrefs = "") => {
    try {
      setLoading(true);
      const payload = {};
      if (userPrefs) payload.preferences = userPrefs;

      // If logged in, gather full user context: favourites, cart, and orders
      if (isLoggedIn) {
        const headers = {
          id: localStorage.getItem("id"),
          authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        // Fetch all user data in parallel
        const requests = [
          axios.get(`${BASE_URL}/get-user-information`, { headers }).catch(() => null),
          axios.get(`${BASE_URL}/get-user-cart`, { headers }).catch(() => null),
          axios.get(`${BASE_URL}/get-order-history`, { headers }).catch(() => null),
        ];

        const [userRes, cartRes, orderRes] = await Promise.all(requests);

        // Favourites
        if (userRes?.data?.favourites?.length > 0) {
          payload.favouriteIds = userRes.data.favourites;
        }

        // Cart items — extract book IDs
        if (cartRes?.data?.data?.length > 0) {
          payload.cartIds = cartRes.data.data
            .map((item) => item.book?._id || item.book)
            .filter(Boolean);
        }

        // Order history — extract unique book IDs
        if (orderRes?.data?.data?.length > 0) {
          const orderedIds = orderRes.data.data
            .map((order) => order.book?._id || order.book)
            .filter(Boolean);
          // Deduplicate
          payload.orderedBookIds = [...new Set(orderedIds.map(String))];
        }
      }

      const res = await axios.post(
        `${BASE_URL}/ai/recommendations`,
        payload
      );
      setRecommendations(res.data.recommendations || []);
    } catch {
      setRecommendations([]);
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [isLoggedIn]);

  const handleRegenerate = () => {
    setRegenerating(true);
    fetchRecommendations(preferences);
  };

  // Skeleton loader
  const SkeletonCard = () => (
    <div className="bg-zinc-800 rounded-lg p-4 flex flex-col gap-3 animate-pulse">
      <div className="bg-zinc-700 rounded h-[25vh] w-full"></div>
      <div className="bg-zinc-700 rounded h-5 w-3/4"></div>
      <div className="bg-zinc-700 rounded h-4 w-1/2"></div>
      <div className="bg-zinc-700 rounded h-5 w-1/3"></div>
    </div>
  );

  return (
    <div className="mt-12 px-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              boxShadow: "0 2px 12px rgba(139, 92, 246, 0.3)",
            }}
          >
            <HiSparkles className="text-white" />
          </div>
          <div>
            <h4 className="text-2xl sm:text-3xl text-yellow-100 font-semibold">
              Recommended for You
            </h4>
            <p className="text-zinc-500 text-sm mt-0.5">
              AI-powered picks based on your taste
            </p>
          </div>
        </div>
      </div>

      {/* Preferences Input */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          placeholder='Tell us what you like... e.g. "sci-fi adventures" or "romance novels"'
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-200 text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRegenerate();
          }}
        />
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 2px 12px rgba(139, 92, 246, 0.3)",
          }}
        >
          <HiSparkles />
          {regenerating ? "Thinking..." : "Get Recommendations"}
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Recommendations Grid */}
      {!loading && recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {recommendations.map((rec, i) => (
            <div key={rec.book?._id || i} className="flex flex-col">
              <BookCard data={rec.book} />
              {rec.reason && (
                <div
                  className="mt-2 px-3 py-2 rounded-lg text-xs text-purple-300 border border-purple-500/20 flex items-start gap-2"
                  style={{
                    background: "rgba(139, 92, 246, 0.08)",
                  }}
                >
                  <HiSparkles className="text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{rec.reason}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && recommendations.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-zinc-500 text-lg">
            No recommendations available right now. Try entering your preferences above!
          </p>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
