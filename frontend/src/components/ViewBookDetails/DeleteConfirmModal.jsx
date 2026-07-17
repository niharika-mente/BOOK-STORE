import BASE_URL from "../../api";
import React, { useState } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";

const DeleteConfirmModal = ({ bookTitle, bookId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    const headers = {
      id: localStorage.getItem("id"),
      authorization: `Bearer ${localStorage.getItem("token")}`,
      bookid: bookId,
    };

    try {
      await axios.delete(`${BASE_URL}/delete-book`, {
        headers,
      });
      onSuccess();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to delete book. Try again."
      );
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
      <div className="relative z-10 w-full max-w-md bg-zinc-800/90 backdrop-blur-md border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700 bg-gradient-to-r from-red-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <RiDeleteBin6Line className="text-red-400 text-xl" />
            <h2 className="text-xl font-bold text-white">Delete Book</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full p-1.5 transition-all duration-200 cursor-pointer"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Warning icon */}
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <RiDeleteBin6Line className="text-red-400 text-3xl" />
            </div>
            <div className="text-center">
              <p className="text-zinc-200 text-base font-medium">
                Are you sure you want to delete
              </p>
              <p className="text-white font-bold text-lg mt-1">
                "{bookTitle}"?
              </p>
              <p className="text-zinc-500 text-sm mt-2">
                This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RiDeleteBin6Line />
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
