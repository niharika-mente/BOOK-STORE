import BASE_URL from "../api";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader/Loader";
import { AiFillDelete } from "react-icons/ai";
import { FaShoppingBag, FaMinus, FaPlus } from "react-icons/fa";
import { MdOutlineShoppingCartCheckout } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState(null); // always [{ book: {...}, quantity: number }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const navigate = useNavigate();

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/get-user-cart`,
        { headers }
      );
      // Normalize: old backend returns flat book objects; new backend returns { book, quantity }.
      // Always store as [{ book: {...}, quantity: number }] internally.
      const raw = response.data.data || [];

      // Read client-side quantity overrides (set when user adds N copies from book detail page)
      const storedQtys = JSON.parse(localStorage.getItem("cartQuantities") || "{}");

      const normalized = raw.map((item) => {
        const bookObj =
          item && item.book && typeof item.book === "object" ? item.book : item;
        const bookId = bookObj._id;
        // Prefer localStorage quantity (reflects what the user actually chose)
        const qty = storedQtys[bookId] || item.quantity || 1;
        return { book: bookObj, quantity: qty };
      });
      setCartItems(normalized);
    } catch (err) {
      setError("Failed to load cart. Please log in and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Remove a book from cart entirely
  const handleDeleteItem = async (bookId) => {
    try {
      await axios.put(
        `${BASE_URL}/remove-from-cart/${bookId}`,
        {},
        { headers }
      );
      // Also remove from localStorage quantities
      const stored = JSON.parse(localStorage.getItem("cartQuantities") || "{}");
      delete stored[bookId];
      localStorage.setItem("cartQuantities", JSON.stringify(stored));

      setCartItems((prev) => prev.filter((item) => item.book?._id !== bookId));
    } catch (err) {
      alert("Failed to remove item. Please try again.");
    }
  };

  // Change quantity for an item — updates localStorage + client state instantly
  const handleQuantityChange = (bookId, newQty) => {
    if (newQty < 1) return;
    // Persist to localStorage so the value survives a page refresh
    const stored = JSON.parse(localStorage.getItem("cartQuantities") || "{}");
    stored[bookId] = newQty;
    localStorage.setItem("cartQuantities", JSON.stringify(stored));

    setCartItems((prev) =>
      prev.map((item) =>
        item.book?._id === bookId ? { ...item, quantity: newQty } : item
      )
    );
  };

  // Place order for all cart items
  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      // Send each book WITH its quantity so the backend can persist it on the Order document
      const orderPayload = cartItems.map((ci) => ({
        ...ci.book,
        quantity: ci.quantity,
      }));

      await axios.post(
        `${BASE_URL}/place-order`,
        { order: orderPayload },
        { headers }
      );

      // Clear client-side quantity store now that the order is placed
      localStorage.removeItem("cartQuantities");

      setCartItems([]);
      alert("🎉 Order placed successfully!");
      navigate("/profile/orderHistory");
    } catch (err) {
      alert("Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Total price (price × qty for each item)
  const totalPrice =
    cartItems?.reduce((sum, item) => sum + (item.book?.price ?? 0) * item.quantity, 0) || 0;

  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // ---- Render states ----

  if (loading) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  if (cartItems && cartItems.length === 0) {
    return (
      <div className="h-screen bg-zinc-900 flex flex-col items-center justify-center gap-6">
        <div className="h-24 w-24 rounded-full bg-zinc-800 flex items-center justify-center shadow-lg">
          <FaShoppingBag className="text-zinc-500 text-5xl" />
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-zinc-400">
          Your Cart is Empty
        </h1>
        <p className="text-zinc-500 text-lg">
          Looks like you haven't added any books yet.
        </p>
        <button
          onClick={() => navigate("/all-books")}
          className="mt-4 px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-bold rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer shadow-lg"
        >
          Browse Books
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 min-h-screen px-4 sm:px-8 lg:px-16 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FaShoppingBag className="text-yellow-400 text-3xl" />
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Your Cart
          </h1>
          <span className="ml-2 bg-yellow-400 text-zinc-900 text-sm font-bold px-3 py-1 rounded-full">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-1 flex flex-col gap-4">
            {cartItems.map((item) => (
              <div
                key={item.book._id}
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:border-zinc-600 transition-all duration-200 group"
              >
                {/* Book Cover */}
                <img
                  src={item.book.url}
                  alt={item.book.title}
                  className="h-28 w-20 object-cover rounded-lg shadow-md flex-shrink-0"
                />

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white leading-tight truncate">
                    {item.book.title}
                  </h2>
                  <p className="text-zinc-400 text-sm mt-1">
                    by{" "}
                    <span className="text-yellow-200 font-medium">
                      {item.book.author}
                    </span>
                  </p>
                  {item.book.desc && (
                    <p className="text-zinc-500 text-sm mt-2 line-clamp-2">
                      {item.book.desc}
                    </p>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-0 mt-3 w-fit rounded-lg overflow-hidden border border-zinc-600 bg-zinc-900">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.book._id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="px-3 py-2 text-zinc-400 hover:bg-zinc-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <FaMinus className="text-xs" />
                    </button>
                    <span className="px-4 py-2 text-white font-bold text-sm min-w-[2.5rem] text-center border-x border-zinc-600">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.book._id, item.quantity + 1)
                      }
                      disabled={item.quantity >= 99}
                      className="px-3 py-2 text-zinc-400 hover:bg-zinc-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <FaPlus className="text-xs" />
                    </button>
                  </div>
                </div>

                {/* Price + Delete */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-yellow-300">
                      ₹{item.book.price * item.quantity}
                    </span>
                    {item.quantity > 1 && (
                      <p className="text-zinc-500 text-xs mt-0.5">
                        ₹{item.book.price} × {item.quantity}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.book._id)}
                    className="bg-red-500/10 hover:bg-red-500 border border-red-500/40 hover:border-red-500 text-red-400 hover:text-white rounded-lg p-2.5 transition-all duration-200 cursor-pointer hover:scale-110"
                    title="Remove from cart"
                  >
                    <AiFillDelete className="text-lg" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Panel */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-4 pb-4 border-b border-zinc-700">
                Order Summary
              </h2>

              {/* Items breakdown */}
              <div className="flex flex-col gap-3 mb-4">
                {cartItems.map((item) => (
                  <div
                    key={item.book._id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-zinc-400 truncate flex-1 mr-2">
                      {item.book.title}
                      {item.quantity > 1 && (
                        <span className="text-zinc-600 ml-1">×{item.quantity}</span>
                      )}
                    </span>
                    <span className="text-zinc-300 font-medium flex-shrink-0">
                      ₹{item.book.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-zinc-700 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300 font-semibold text-lg">
                    Total
                  </span>
                  <span className="text-yellow-300 font-bold text-2xl">
                    ₹{totalPrice}
                  </span>
                </div>
                {totalItems > 1 && (
                  <p className="text-zinc-500 text-xs mt-1 text-right">
                    {totalItems} items
                  </p>
                )}
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:scale-105 shadow-lg text-lg"
              >
                <MdOutlineShoppingCartCheckout className="text-xl" />
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>

              <button
                onClick={() => navigate("/all-books")}
                className="w-full mt-3 py-3 border border-zinc-600 hover:bg-zinc-700 text-zinc-300 hover:text-white font-semibold rounded-lg transition-all duration-200 cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;