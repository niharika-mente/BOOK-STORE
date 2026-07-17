import BASE_URL from "../../api";
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '../Loader/Loader'
import { useParams, useNavigate } from 'react-router-dom'
import { GrLanguage } from "react-icons/gr";
import { FaHeart, FaShoppingCart, FaEdit, FaMinus, FaPlus, FaCheck } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useSelector } from 'react-redux';
import EditBookModal from './EditBookModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const ViewBookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [Data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartToast, setCartToast] = useState(null); // { type: 'success'|'error', msg }
  const [addingToCart, setAddingToCart] = useState(false);
  const [favouriteToast, setFavouriteToast] = useState(null);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const role = useSelector((state) => state.auth.role);

  const showToast = (setter, type, msg) => {
    setter({ type, msg });
    setTimeout(() => setter(null), 3000);
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/get-book-by-id/${id}`
        );
        setData(response.data.data);
      } catch (err) {
        setError("Unable to load book details. Please make sure the server is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [id]);

  const handleFavourite = async () => {
    const headers = {
      id: localStorage.getItem("id"),
      authorization: `Bearer ${localStorage.getItem("token")}`,
      bookid: id,
    };
    try {
      const response = await axios.put(
        `${BASE_URL}/add-book-to-favourite`,
        {},
        { headers }
      );
      showToast(setFavouriteToast, 'success', response.data.message);
    } catch (err) {
      showToast(setFavouriteToast, 'error', 'Could not update favourites.');
    }
  };

  const handleCart = async () => {
    if (addingToCart) return;
    setAddingToCart(true);
    const headers = {
      id: localStorage.getItem("id"),
      authorization: `Bearer ${localStorage.getItem("token")}`,
      bookid: id,
    };
    try {
      await axios.put(
        `${BASE_URL}/add-to-cart`,
        { quantity },
        { headers }
      );

      // Persist quantity client-side so Cart page can display the correct value
      // regardless of what the backend stores (remote backend ignores quantity).
      const stored = JSON.parse(localStorage.getItem("cartQuantities") || "{}");
      stored[id] = (stored[id] || 0) + quantity;
      localStorage.setItem("cartQuantities", JSON.stringify(stored));

      showToast(setCartToast, 'success', `${quantity} × "${Data?.title}" added to cart!`);
    } catch (err) {
      showToast(setCartToast, 'error', 'Could not add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Called by EditBookModal on success — update local state & close
  const handleEditSuccess = (updatedBook) => {
    setData(updatedBook);
    setShowEditModal(false);
  };

  // Called by DeleteConfirmModal on success — navigate away
  const handleDeleteSuccess = () => {
    navigate("/all-books");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Cart Toast */}
      {cartToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold transition-all duration-300 animate-slide-up ${
            cartToast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {cartToast.type === 'success' ? <FaCheck /> : null}
          {cartToast.msg}
        </div>
      )}

      {/* Favourite Toast */}
      {favouriteToast && (
        <div
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold ${
            favouriteToast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <FaHeart />
          {favouriteToast.msg}
        </div>
      )}

      {Data && (
        <div className="px-4 sm:px-8 lg:px-16 py-8 bg-zinc-900 min-h-screen">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Book Image */}
            <div className="bg-zinc-800 rounded-lg p-4 sm:p-6 w-full lg:w-1/2 flex items-center justify-center relative">
              {Data?.url ? (
                <div className="flex flex-col lg:flex-row justify-center items-center gap-6 w-full relative">
                  <img
                    src={Data.url}
                    alt={Data.title}
                    className="max-h-[50vh] sm:max-h-[60vh] lg:max-h-[75vh] max-w-full object-contain rounded"
                  />

                  {/* User: Favourite & Cart */}
                  {isLoggedIn && role === "user" && (
                    <div className="flex lg:flex-col gap-4 mt-4 lg:mt-0 lg:absolute lg:top-0 lg:right-4 z-10">
                      <button
                        onClick={handleFavourite}
                        className="bg-zinc-300 hover:bg-zinc-100 hover:scale-110 text-red-500 rounded-full p-4 text-xl flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer"
                        title="Add to Favourites"
                      >
                        <FaHeart />
                      </button>
                      <button
                        onClick={handleCart}
                        disabled={addingToCart}
                        className="bg-blue-500 hover:bg-blue-600 hover:scale-110 disabled:opacity-60 text-white rounded-full p-4 text-xl flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer"
                        title="Add to Cart"
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                  )}

                  {/* Admin: Edit & Delete */}
                  {isLoggedIn && role === "admin" && (
                    <div className="flex lg:flex-col gap-4 mt-4 lg:mt-0 lg:absolute lg:top-0 lg:right-4 z-10">
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="bg-yellow-400 hover:bg-yellow-300 hover:scale-110 text-zinc-900 rounded-full p-4 text-xl flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer"
                        title="Edit Book"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-500 hover:bg-red-600 hover:scale-110 text-white rounded-full p-4 text-xl flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer"
                        title="Delete Book"
                      >
                        <RiDeleteBin6Line />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-400">No image available</p>
              )}
            </div>

            {/* Book Details */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {Data?.title}
              </h1>

              <p className="text-zinc-400 text-base sm:text-lg">
                by{" "}
                <span className="text-yellow-100 font-semibold">
                  {Data?.author}
                </span>
              </p>

              {Data?.language && (
                <p className="text-zinc-400 flex items-center text-sm sm:text-base">
                  <GrLanguage className="me-2 flex-shrink-0" />
                  {Data.language}
                </p>
              )}

              <p className="text-2xl sm:text-3xl font-bold text-yellow-200">
                ₹{Data?.price}
              </p>

              {Data?.desc && (
                <div className="mt-2 border-t border-zinc-700 pt-4">
                  <h4 className="text-zinc-300 text-lg font-semibold mb-2">
                    About this book
                  </h4>
                  <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                    {Data.desc}
                  </p>
                </div>
              )}

              {/* Quantity + Add to Cart — users only */}
              {isLoggedIn && role === "user" && (
                <div className="mt-4 pt-4 border-t border-zinc-700">
                  {/* Quantity Selector */}
                  <p className="text-zinc-400 text-sm mb-3 font-medium">Quantity</p>
                  <div className="flex items-center gap-0 mb-4 w-fit rounded-xl overflow-hidden border border-zinc-600 bg-zinc-800 shadow-md">
                    <button
                      id="qty-decrease"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-4 py-3 text-zinc-300 hover:bg-zinc-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <FaMinus className="text-xs" />
                    </button>
                    <span
                      id="qty-value"
                      className="px-6 py-3 text-white font-bold text-lg min-w-[3rem] text-center select-none border-x border-zinc-600"
                    >
                      {quantity}
                    </span>
                    <button
                      id="qty-increase"
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      disabled={quantity >= 99}
                      className="px-4 py-3 text-zinc-300 hover:bg-zinc-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>

                  {/* Subtotal preview */}
                  {quantity > 1 && (
                    <p className="text-zinc-500 text-sm mb-4">
                      Subtotal:{" "}
                      <span className="text-yellow-300 font-semibold">
                        ₹{(Data?.price * quantity).toFixed(0)}
                      </span>
                    </p>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    id="add-to-cart-btn"
                    onClick={handleCart}
                    disabled={addingToCart}
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer text-base"
                  >
                    <FaShoppingCart />
                    {addingToCart ? "Adding..." : `Add ${quantity > 1 ? quantity + " copies" : "to Cart"}`}
                  </button>

                  {/* Also keep favourite button here */}
                  <button
                    id="add-to-fav-btn"
                    onClick={handleFavourite}
                    className="mt-3 flex items-center gap-2 border border-zinc-600 hover:border-red-400 text-zinc-400 hover:text-red-400 font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-sm"
                  >
                    <FaHeart />
                    Add to Favourites
                  </button>
                </div>
              )}

              {/* Admin action buttons in detail panel too */}
              {isLoggedIn && role === "admin" && (
                <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-700">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-bold px-6 py-2.5 rounded-lg shadow transition-all duration-200 cursor-pointer hover:scale-105"
                  >
                    <FaEdit />
                    Edit Book
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-lg shadow transition-all duration-200 cursor-pointer hover:scale-105"
                  >
                    <RiDeleteBin6Line />
                    Delete Book
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!Data && (
        <div className="h-screen bg-zinc-900 flex items-center justify-center">
          <Loader />
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditBookModal
          bookData={Data}
          bookId={id}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          bookTitle={Data?.title}
          bookId={id}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
};

export default ViewBookDetails;
