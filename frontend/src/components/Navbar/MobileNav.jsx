import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaXmark } from "react-icons/fa6";
import { FaHome, FaBook, FaShoppingCart, FaUser } from "react-icons/fa";
import { MdLogin } from "react-icons/md";
import { RiUserAddFill, RiShieldUserFill } from "react-icons/ri";

const MobileNav = ({ links, isLoggedIn, role, onClose }) => {
  const location = useLocation();

  const iconMap = {
    Home: <FaHome />,
    "All Books": <FaBook />,
    Cart: <FaShoppingCart />,
    Profile: <FaUser />,
  };

  const isProfileActive = location.pathname.startsWith("/profile");

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel — slides in from right */}
      <div className="relative ml-auto h-full w-4/5 max-w-xs bg-zinc-900 border-l border-zinc-700 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <span className="text-white font-bold text-lg tracking-wide">Menu</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full p-2 transition-all duration-200 cursor-pointer"
            aria-label="Close menu"
          >
            <FaXmark className="text-xl" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 px-4 py-5 flex-1">
          {links.map((item, i) => {
            const isActive = location.pathname === item.link;
            return (
              <Link
                key={i}
                to={item.link}
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  isActive
                    ? "bg-yellow-400 text-zinc-900"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span className="text-xl">{iconMap[item.title] || <FaBook />}</span>
                {item.title}
              </Link>
            );
          })}

          {/* Profile / Admin Profile link */}
          {isLoggedIn && (
            <Link
              to="/profile"
              onClick={onClose}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-semibold text-lg transition-all duration-200 mt-1 ${
                isProfileActive
                  ? role === "admin"
                    ? "bg-yellow-400 text-zinc-900"
                    : "bg-yellow-400 text-zinc-900"
                  : role === "admin"
                  ? "text-yellow-400 hover:bg-zinc-800 hover:text-yellow-300"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <span className="text-xl">
                {role === "admin" ? <RiShieldUserFill /> : <FaUser />}
              </span>
              {role === "admin" ? "Admin Profile" : "Profile"}
            </Link>
          )}
        </nav>

        {/* Auth Buttons (guests only) */}
        {!isLoggedIn && (
          <div className="px-4 pb-8 flex flex-col gap-3 border-t border-zinc-800 pt-6">
            <Link
              to="/Login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-semibold text-lg transition-all duration-200 cursor-pointer"
            >
              <MdLogin className="text-xl" />
              Log In
            </Link>
            <Link
              to="/Signup"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-lg transition-all duration-200 cursor-pointer"
            >
              <RiUserAddFill className="text-xl" />
              Sign Up
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-6 text-center text-zinc-600 text-xs">
          BookVerse © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
