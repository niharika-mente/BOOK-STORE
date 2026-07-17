import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaGripLines } from "react-icons/fa6";
import { RiShieldUserFill } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import book from "../../assets/book.png";
import { useSelector } from "react-redux";
import MobileNav from "./MobileNav";

const Navbar = () => {
  const location = useLocation();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const role = useSelector((state) => state.auth.role);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Base links for everyone
  const baseLinks = [
    { title: "Home", link: "/" },
    { title: "All Books", link: "/all-books" },
  ];

  // User-only links
  const userLinks = [
    ...baseLinks,
    { title: "Cart", link: "/cart" },
  ];

  // Admin-only links (no Cart)
  const adminLinks = [...baseLinks];

  // Guest links (no Cart, no Profile)
  const guestLinks = [...baseLinks];

  const links = !isLoggedIn
    ? guestLinks
    : role === "admin"
    ? adminLinks
    : userLinks;

  const profileLink = "/profile";
  const isProfileActive = location.pathname.startsWith("/profile");

  return (
    <>
      <nav className="z-50 relative flex bg-zinc-800 text-white px-8 py-4 items-center justify-between shadow-lg">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img className="h-10" src={book} alt="logo" />
          <h1 className="text-2xl font-bold tracking-wide">BookVerse</h1>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((item, i) => {
            const isActive = location.pathname === item.link;
            return (
              <Link
                key={i}
                to={item.link}
                className={`font-medium transition-all duration-200 ${
                  isActive
                    ? "text-yellow-400"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                {item.title}
              </Link>
            );
          })}

          {/* Profile / Admin Profile button */}
          {isLoggedIn && (
            <Link
              to={profileLink}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border font-semibold transition-all duration-200 ${
                role === "admin"
                  ? isProfileActive
                    ? "bg-yellow-400 border-yellow-400 text-zinc-900"
                    : "border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-zinc-900"
                  : isProfileActive
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
              }`}
            >
              {role === "admin" ? (
                <>
                  <RiShieldUserFill className="text-base" />
                  Admin Profile
                </>
              ) : (
                <>
                  <FaUser className="text-sm" />
                  Profile
                </>
              )}
            </Link>
          )}

          {/* Auth buttons for guests */}
          {!isLoggedIn && (
            <div className="flex gap-3 ml-2">
              <Link
                to="/Login"
                className="px-4 py-1.5 border border-blue-500 rounded text-blue-400 hover:bg-blue-500 hover:text-white font-medium transition-all duration-200"
              >
                Log In
              </Link>
              <Link
                to="/Signup"
                className="px-4 py-1.5 bg-blue-500 hover:bg-blue-400 rounded text-white font-semibold transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="block md:hidden text-zinc-300 hover:text-white text-2xl transition-colors duration-200 cursor-pointer"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <FaGripLines />
        </button>
      </nav>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <MobileNav
          links={links}
          isLoggedIn={isLoggedIn}
          role={role}
          onClose={() => setMobileNavOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
