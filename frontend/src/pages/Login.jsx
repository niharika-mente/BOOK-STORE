import BASE_URL from "../api";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { authActions } from "../store/auth"; 
import {useDispatch} from "react-redux";

const Login = () => {
  const [values, setValues] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    if (!values.username || !values.password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/sign-in`,
        values
      );
      // Store auth data
      dispatch(authActions.login());
      dispatch(authActions.changeRole(response.data.role))
      localStorage.setItem("id", response.data.id);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      navigate("/profile");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-900 px-4 sm:px-8 flex items-center justify-center py-8">
      <div className="bg-zinc-800 rounded-lg px-6 sm:px-8 py-8 w-full max-w-md shadow-lg">
        <h2 className="text-zinc-100 text-2xl font-bold text-center">
          Welcome Back
        </h2>
        <p className="text-zinc-500 text-sm text-center mt-1">
          Log in to your BookVerse account
        </p>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="mt-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="text-zinc-400 text-sm">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full mt-2 bg-zinc-900 text-zinc-100 p-3 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter your username"
              name="username"
              value={values.username}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              required
            />
          </div>

          {/* Password */}
          <div className="mt-4">
            <label htmlFor="password" className="text-zinc-400 text-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full mt-2 bg-zinc-900 text-zinc-100 p-3 rounded-lg outline-none border border-zinc-700 focus:border-blue-500 transition-colors duration-200 pr-12"
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
          </div>

          {/* Login Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </div>

          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-zinc-700"></div>
            <span className="px-4 text-zinc-500 text-sm">or</span>
            <div className="flex-1 h-px bg-zinc-700"></div>
          </div>

          <p className="text-center text-zinc-500 text-sm">
            Don't have an account?{" "}
            <Link
              to="/Signup"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;