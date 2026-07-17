import BASE_URL from "../../api";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Loader/Loader";

const Settings = () => {
  const [profile, setProfile] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/get-user-information`,
          { headers }
        );
        setProfile(response.data);
        setAddress(response.data.address);
      } catch (err) {
        setError("Failed to fetch profile settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleUpdateAddress = async () => {
    if (!address.trim()) {
      setError("Address cannot be empty.");
      return;
    }
    setUpdating(true);
    setMessage("");
    setError("");
    try {
      const response = await axios.put(
        `${BASE_URL}/update-address`,
        { address },
        { headers }
      );
      setMessage(response.data.message || "Address updated successfully!");
    } catch (err) {
      setError("Failed to update address. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl">
      <h2 className="text-2xl font-bold text-yellow-100 mb-6">Settings</h2>

      {message && (
        <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
          <p className="text-green-400 text-sm">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {profile && (
        <div className="flex flex-col gap-6 bg-zinc-800/40 border border-zinc-800 rounded-lg p-6">
          {/* Username (Read-only) */}
          <div>
            <label className="text-zinc-400 text-sm">Username</label>
            <p className="w-full mt-2 bg-zinc-900/50 text-zinc-100 p-3 rounded-lg border border-zinc-800 select-none">
              {profile.username}
            </p>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="text-zinc-400 text-sm">Email Address</label>
            <p className="w-full mt-2 bg-zinc-900/50 text-zinc-100 p-3 rounded-lg border border-zinc-800 select-none">
              {profile.email}
            </p>
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="text-zinc-400 text-sm">Account Type</label>
            <p className="w-full mt-2 bg-zinc-900/50 text-zinc-100 p-3 rounded-lg border border-zinc-800 capitalize select-none">
              {profile.role}
            </p>
          </div>

          {/* Address (Editable) */}
          <div>
            <label htmlFor="address" className="text-zinc-400 text-sm">
              Shipping Address
            </label>
            <textarea
              id="address"
              className="w-full mt-2 bg-zinc-900 text-zinc-100 p-3 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-colors duration-200 resize-none"
              rows="3"
              placeholder="Enter your address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError("");
                setMessage("");
              }}
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleUpdateAddress}
              disabled={updating}
              className="bg-yellow-200 text-zinc-900 font-bold px-6 py-2.5 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
            >
              {updating ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
