import BASE_URL from "../../api";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Loader from "../Loader/Loader";
import { FaBoxOpen, FaUser, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

// ── User Profile Popover ──────────────────────────────────────────────────────
const UserPopover = ({ user, onClose, anchorRef }) => {
  const popoverRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-zinc-800 border border-zinc-600 rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
    >
      {/* Header gradient strip */}
      <div className="h-10 bg-gradient-to-r from-yellow-500/30 via-yellow-400/10 to-transparent" />

      {/* Avatar */}
      <div className="flex flex-col items-center -mt-8 px-5 pb-5">
        <img
          src={user?.avatar || "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"}
          alt={user?.username}
          className="h-16 w-16 rounded-full border-4 border-zinc-800 bg-zinc-900 object-cover shadow-lg"
        />
        <h4 className="mt-2 text-white font-bold text-base text-center leading-tight">
          {user?.username || "Unknown"}
        </h4>

        <div className="w-full mt-4 flex flex-col gap-2.5">
          {/* Email */}
          <div className="flex items-start gap-2.5">
            <FaEnvelope className="text-yellow-400 text-sm mt-0.5 flex-shrink-0" />
            <span className="text-zinc-300 text-xs break-all leading-relaxed">
              {user?.email || "No email"}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2.5">
            <FaMapMarkerAlt className="text-yellow-400 text-sm mt-0.5 flex-shrink-0" />
            <span className="text-zinc-300 text-xs leading-relaxed">
              {user?.address || "No address on file"}
            </span>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full p-1 transition-all duration-150 cursor-pointer"
      >
        <IoClose className="text-sm" />
      </button>
    </div>
  );
};

// ── User Avatar Button (per row) ──────────────────────────────────────────────
const UserAvatarButton = ({ user }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  return (
    <div className="relative inline-block">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center h-9 w-9 rounded-full overflow-hidden border-2 border-zinc-600 hover:border-yellow-400 transition-all duration-200 cursor-pointer hover:scale-110 shadow-md"
        title={`View profile: ${user?.username}`}
      >
        <img
          src={user?.avatar || "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"}
          alt={user?.username || "User"}
          className="h-full w-full object-cover bg-zinc-900"
        />
      </button>

      {open && (
        <UserPopover user={user} onClose={() => setOpen(false)} anchorRef={btnRef} />
      )}
    </div>
  );
};

// ── Main AllOrders Component ──────────────────────────────────────────────────
const AllOrders = () => {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/get-all-orders`,
          { headers }
        );
        setOrders(response.data.data);
      } catch (err) {
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Order Placed":     return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case "Out for Delivery": return "text-blue-400 bg-blue-400/10 border-blue-400/30";
      case "Delivered":        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "Cancelled":        return "text-red-400 bg-red-400/10 border-red-400/30";
      default:                 return "text-zinc-400 bg-zinc-400/10 border-zinc-400/30";
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${BASE_URL}/update-status/${orderId}`,
        { status: newStatus },
        { headers }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert("Failed to update order status.");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[50vh]"><Loader /></div>;
  if (error)   return <div className="flex items-center justify-center h-[50vh]"><p className="text-red-400 text-lg">{error}</p></div>;

  if (!orders || orders.length === 0) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-zinc-500 gap-4">
        <FaBoxOpen className="text-6xl text-zinc-600" />
        <p className="text-xl font-semibold">No Orders Yet</p>
        <p className="text-sm">Orders placed by users will appear here.</p>
      </div>
    );
  }

  const statusOptions = ["Order Placed", "Out for Delivery", "Delivered", "Cancelled"];

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FaBoxOpen className="text-yellow-400 text-2xl" />
        <h2 className="text-2xl font-bold text-yellow-100">All Orders</h2>
        <span className="ml-1 bg-yellow-400 text-zinc-900 text-xs font-bold px-2.5 py-1 rounded-full">
          {orders.length}
        </span>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-zinc-700">
        <table className="w-full text-left text-zinc-300">
          <thead className="bg-zinc-800 text-zinc-400 text-sm uppercase">
            <tr>
              <th className="px-5 py-4">#</th>
              <th className="px-5 py-4">Book</th>
              <th className="px-5 py-4 text-center">User</th>
              <th className="px-4 py-4 text-center">Qty</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {orders.map((item, i) => (
              <tr key={item._id} className="hover:bg-zinc-800/40 transition-colors">
                {/* # */}
                <td className="px-5 py-4 font-medium text-zinc-400">{i + 1}</td>

                {/* Book */}
                <td className="px-5 py-4">
                  {item.book ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={item.book.url}
                        alt={item.book.title}
                        className="h-12 w-8 object-contain rounded bg-zinc-900 p-0.5"
                      />
                      <span className="font-semibold text-white text-sm line-clamp-2 max-w-[160px]">
                        {item.book.title}
                      </span>
                    </div>
                  ) : (
                    <span className="text-zinc-500 text-sm italic">Book Deleted</span>
                  )}
                </td>

                {/* User avatar — click for popover */}
                <td className="px-5 py-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <UserAvatarButton user={item.user} />
                    <span className="text-zinc-400 text-xs font-medium truncate max-w-[80px] text-center">
                      {item.user?.username || "Unknown"}
                    </span>
                  </div>
                </td>

                {/* Qty */}
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-zinc-700 text-white text-xs font-bold border border-zinc-600">
                    {item.quantity || 1}
                  </span>
                </td>

                {/* Price */}
                <td className="px-5 py-4">
                  <span className="font-bold text-yellow-300">
                    ₹{(item.book?.price || 0) * (item.quantity || 1)}
                  </span>
                  {(item.quantity || 1) > 1 && (
                    <p className="text-zinc-500 text-xs mt-0.5">
                      ₹{item.book?.price} × {item.quantity}
                    </p>
                  )}
                </td>

                {/* Status badge */}
                <td className="px-5 py-4">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>

                {/* Status dropdown */}
                <td className="px-5 py-4">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    className="bg-zinc-800 border border-zinc-600 text-zinc-300 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-yellow-400 cursor-pointer transition-colors"
                  >
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden flex flex-col gap-4">
        {orders.map((item, i) => (
          <div key={item._id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-500">Order #{i + 1}</span>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>

            {/* Book */}
            {item.book ? (
              <div className="flex gap-3 items-center">
                <img
                  src={item.book.url}
                  alt={item.book.title}
                  className="h-16 w-12 object-contain rounded bg-zinc-900 p-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{item.book.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-yellow-300 font-semibold">
                      ₹{(item.book.price || 0) * (item.quantity || 1)}
                    </p>
                    {(item.quantity || 1) > 1 && (
                      <span className="text-zinc-500 text-xs">
                        (₹{item.book.price} × {item.quantity})
                      </span>
                    )}
                  </div>
                </div>
                {/* Qty badge */}
                <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-zinc-700 text-white text-sm font-bold border border-zinc-600">
                  {item.quantity || 1}
                </span>
              </div>
            ) : (
              <p className="text-zinc-500 text-sm italic">Book Deleted</p>
            )}

            {/* User row with avatar popover */}
            <div className="flex items-center gap-3 border-t border-zinc-700/60 pt-3">
              <UserAvatarButton user={item.user} />
              <div className="flex flex-col min-w-0">
                <span className="text-zinc-200 text-sm font-semibold truncate">
                  {item.user?.username || "Unknown"}
                </span>
                <span className="text-zinc-500 text-xs truncate">
                  {item.user?.email || ""}
                </span>
              </div>
            </div>

            {/* Status dropdown */}
            <select
              value={item.status}
              onChange={(e) => handleStatusChange(item._id, e.target.value)}
              className="bg-zinc-800 border border-zinc-600 text-zinc-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-yellow-400 cursor-pointer w-full"
            >
              {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllOrders;
