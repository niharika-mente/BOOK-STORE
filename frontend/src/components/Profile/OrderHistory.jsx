import BASE_URL from "../../api";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Loader/Loader";

const OrderHistory = () => {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/get-order-history`,
          { headers }
        );
        setOrders(response.data.data);
      } catch (err) {
        setError("Failed to fetch order history.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderHistory();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Order Placed":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Out for Delivery":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "Delivered":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "Cancelled":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-zinc-500 gap-4">
        <p className="text-xl font-semibold">No Orders Yet</p>
        <p className="text-sm">When you place an order, it will appear here!</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-yellow-100 mb-6">Order History</h2>
      
      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-zinc-300">
          <thead className="bg-zinc-800 text-zinc-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">Sr No.</th>
              <th className="px-6 py-4">Book</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-4 py-4 text-center">Qty</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {orders.map((item, i) => (
              <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4 font-medium">{i + 1}</td>
                <td className="px-6 py-4">
                  {item.book ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={item.book.url}
                        alt={item.book.title}
                        className="h-12 w-8 object-contain rounded"
                      />
                      <span className="font-semibold text-white hover:text-blue-400 cursor-pointer">
                        {item.book.title}
                      </span>
                    </div>
                  ) : (
                    <span className="text-zinc-500">Book Deleted</span>
                  )}
                </td>
                <td className="px-6 py-4 max-w-xs truncate">
                  {item.book?.desc || "N/A"}
                </td>
                {/* Qty */}
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-zinc-700 text-white text-xs font-bold border border-zinc-600">
                    {item.quantity || 1}
                  </span>
                </td>
                {/* Price */}
                <td className="px-6 py-4">
                  <span className="font-semibold text-yellow-200">
                    ₹{(item.book?.price || 0) * (item.quantity || 1)}
                  </span>
                  {(item.quantity || 1) > 1 && (
                    <p className="text-zinc-500 text-xs mt-0.5">
                      ₹{item.book?.price} × {item.quantity}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden flex flex-col gap-4">
        {orders.map((item, i) => (
          <div key={i} className="bg-zinc-800/40 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start gap-4">
              <span className="text-sm font-semibold text-zinc-500">Order #{i + 1}</span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
            
            {item.book ? (
              <div className="flex gap-4 items-center">
                <img
                  src={item.book.url}
                  alt={item.book.title}
                  className="h-16 w-12 object-contain rounded bg-zinc-900 p-1"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white truncate">{item.book.title}</h4>
                  <p className="text-zinc-400 text-sm truncate">{item.book.desc}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-yellow-200 font-semibold">
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
              <p className="text-zinc-500 text-sm">Book Deleted</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
