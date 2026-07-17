import BASE_URL from "../../api";
import React, { useState } from "react";
import axios from "axios";
import { FaBookMedical } from "react-icons/fa";
import { MdOutlineAddCircle } from "react-icons/md";

const AddBook = () => {
  const [form, setForm] = useState({
    url: "",
    title: "",
    author: "",
    price: "",
    language: "",
    desc: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await axios.post(
        `${BASE_URL}/add-book`,
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
      setSuccessMsg(response.data.message || "Book added successfully!");
      setForm({ url: "", title: "", author: "", price: "", language: "", desc: "" });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add book. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FaBookMedical className="text-yellow-400 text-2xl" />
        <h2 className="text-2xl font-bold text-yellow-100">Add New Book</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-800/60 border border-zinc-700 rounded-2xl p-6 flex flex-col gap-5"
      >
        {/* Success */}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 text-sm font-medium">
            ✅ {successMsg}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm font-medium">
            ❌ {error}
          </div>
        )}

        {/* Image URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-300 text-sm font-semibold">
            Book Cover Image URL
          </label>
          <input
            type="url"
            name="url"
            value={form.url}
            onChange={handleChange}
            placeholder="https://example.com/cover.jpg"
            required
            className="bg-zinc-900 border border-zinc-700 focus:border-yellow-400 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 outline-none transition-all duration-200 text-sm"
          />
          {form.url && (
            <img
              src={form.url}
              alt="Preview"
              className="mt-2 h-28 w-20 object-contain rounded bg-zinc-900 border border-zinc-700 p-1 self-start"
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-300 text-sm font-semibold">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Book title"
            className="bg-zinc-900 border border-zinc-700 focus:border-yellow-400 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 outline-none transition-all duration-200 text-sm"
          />
        </div>

        {/* Author */}
        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-300 text-sm font-semibold">
            Author <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="author"
            value={form.author}
            onChange={handleChange}
            required
            placeholder="Author name"
            className="bg-zinc-900 border border-zinc-700 focus:border-yellow-400 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 outline-none transition-all duration-200 text-sm"
          />
        </div>

        {/* Price & Language */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-zinc-300 text-sm font-semibold">
              Price (₹) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
              placeholder="299"
              className="bg-zinc-900 border border-zinc-700 focus:border-yellow-400 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 outline-none transition-all duration-200 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-zinc-300 text-sm font-semibold">
              Language <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="language"
              value={form.language}
              onChange={handleChange}
              required
              placeholder="English"
              className="bg-zinc-900 border border-zinc-700 focus:border-yellow-400 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 outline-none transition-all duration-200 text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-zinc-300 text-sm font-semibold">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            name="desc"
            value={form.desc}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Write a brief description about the book..."
            className="bg-zinc-900 border border-zinc-700 focus:border-yellow-400 rounded-lg px-4 py-2.5 text-white placeholder-zinc-600 outline-none transition-all duration-200 text-sm resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:scale-[1.02] shadow-lg text-base mt-1"
        >
          <MdOutlineAddCircle className="text-xl" />
          {loading ? "Adding Book..." : "Add Book"}
        </button>
      </form>
    </div>
  );
};

export default AddBook;
