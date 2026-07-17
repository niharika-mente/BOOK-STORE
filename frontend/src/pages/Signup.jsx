import BASE_URL from "../api";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const SignUp = () => {

  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    // Client-side validation
    if (!values.username || !values.email || !values.password || !values.address) {
      setError("All fields are required.");
      return;
    }
    if (values.username.length < 4) {
      setError("Username must be at least 4 characters.");
      return;
    }
    if (values.password.length <= 5) {
      setError("Password must be more than 5 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/sign-up`,
        values
      );
      alert(response.data.message);
      navigate("/Login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="bg-zinc-900 px-4 sm:px-8 flex items-center justify-center py-4 sm:py-6" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div className="bg-zinc-800 rounded-lg px-6 sm:px-8 py-6 w-full max-w-md shadow-lg">
        <h2 className="text-zinc-100 text-2xl font-bold text-center">
          Create an Account
        </h2>
        <p className="text-zinc-500 text-sm text-center mt-1">
          Join BookVerse and explore your next read
        </p>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="mt-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="text-zinc-400 text-sm">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full mt-1 bg-zinc-900 text-zinc-100 p-2 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter your username"
              name="username"
              value={values.username}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
            />
          </div>

          {/* Email */}
          <div className="mt-3">
            <label htmlFor="email" className="text-zinc-400 text-sm">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full mt-1 bg-zinc-900 text-zinc-100 p-2 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-colors duration-200"
              placeholder="xyz@example.com"
              name="email"
              value={values.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
            />
          </div>

          {/* Password */}
          <div className="mt-3">
            <label htmlFor="password" className="text-zinc-400 text-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full mt-1 bg-zinc-900 text-zinc-100 p-2 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-colors duration-200 pr-12"
                placeholder="Enter your password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 translate-y-[-30%] text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-zinc-600 text-xs mt-1">
              Must be more than 5 characters
            </p>
          </div>

          {/* Address */}
          <div className="mt-3">
            <label htmlFor="address" className="text-zinc-400 text-sm">
              Address
            </label>
            <textarea
              id="address"
              className="w-full mt-1 bg-zinc-900 text-zinc-100 p-2 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-colors duration-200 resize-none"
              rows="2"
              placeholder="Enter your address"
              name="address"
              value={values.address}
              onChange={handleChange}
              required
            />
          </div>

          {/* Signup Button */}
          <div className="mt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-500 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </div>

          <div className="flex items-center my-3">
            <div className="flex-1 h-px bg-zinc-700"></div>
            <span className="px-4 text-zinc-500 text-sm">or</span>
            <div className="flex-1 h-px bg-zinc-700"></div>
          </div>

          <p className="text-center text-zinc-500 text-sm">
            Already have an account?{" "}
            <Link
              to="/Login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;