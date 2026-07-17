import BASE_URL from "../../api";
import React, { useState } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";

const EditBookModal = ({ bookData, bookId, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    url: bookData?.url || "",
    title: bookData?.title || "",
    author: bookData?.author || "",
    price: bookData?.price || "",
    language: bookData?.language || "",
    desc: bookData?.desc || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const headers = {
      id: localStorage.getItem("id"),
      authorization: `Bearer ${localStorage.getItem("token")}`,
      bookid: bookId,
    };

    try {
      const response = await axios.put(
        `${BASE_URL}/update-book`,
        {
          url: form.url,
          title: form.title,
          author: form.author,
          price: Number(form.price),
          language: form.language,
          desc: form.desc,
        },
        { headers }
      );
      onSuccess({ ...bookData, ...form, price: Number(form.price) });
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to update book. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-zinc-800/90 backdrop-blur-md border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700 bg-gradient-to-r from-yellow-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <FaBookOpen className="text-yellow-400 text-xl" />
            <h2 className="text-xl font-bold text-white">Edit Book</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full p-1.5 transition-all duration-200 cursor-pointer"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Image URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-300 text-sm font-medium">Image URL</label>
            <input
              type="url"
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://example.com/book-cover.jpg"
              className="bg-zinc-900 border border-zinc-700 focus:border-yellow-400 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition-all duration-200 text-sm"
            />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-300 text-sm font-medium">Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Book title"
              className="bg-zinc-900 border border-zinc-700 focus:border-yellow-400 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition-all duration-200 text-sm"
            />
          </div>

          {/* Author */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-300 text-sm font-medium">Author <span className="text-red-400">*</span></label>
            <input
              type="text"
              name="author"
              value={form.author}
              onChange={handleChange}
              required
              placeholder="Author name"
              className="bg-zinc-900 border border-zinc-700 focus:border-yellow-400 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition-all duration-200 text-sm"
            />
          </div>

          {/* Price & Language row */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-zinc-300 text-sm font-medium">Price (₹) <span className="text-red-400">*</span></label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                placeholder="299"
                className="bg-zinc-900 border border-zinc-700 focus:border-yellow-400 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition-all duration-200 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-zinc-300 text-sm font-medium">Language <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="language"
                value={form.language}
                onChange={handleChange}
                required
                placeholder="English"
                className="bg-zinc-900 border border-zinc-700 focus:border-yellow-400 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-300 text-sm font-medium">Description <span className="text-red-400">*</span></label>
            <textarea
              name="desc"
              value={form.desc}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Write a brief description about the book..."
              className="bg-zinc-900 border border-zinc-700 focus:border-yellow-400 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition-all duration-200 text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white font-semibold transition-all duration-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookModal;
