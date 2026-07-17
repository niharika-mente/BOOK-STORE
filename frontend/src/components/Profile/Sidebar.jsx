import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../store/auth";
import { IoLogOutOutline } from "react-icons/io5";
import { FaHeart, FaClipboardList, FaCog, FaBoxOpen } from "react-icons/fa";
import { MdOutlineAddCircle } from "react-icons/md";
import { RiShieldUserFill } from "react-icons/ri";

const Sidebar = ({ data }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const role = useSelector((state) => state.auth.role);

  const handleLogout = () => {
    dispatch(authActions.logout());
    localStorage.clear();
    navigate("/");
  };

  const userMenuItems = [
    { title: "Favourites", link: "/profile", icon: <FaHeart /> },
    { title: "Order History", link: "/profile/orderHistory", icon: <FaClipboardList /> },
    { title: "Settings", link: "/profile/settings", icon: <FaCog /> },
  ];

  const adminMenuItems = [
    { title: "All Orders", link: "/profile", icon: <FaBoxOpen /> },
    { title: "Add Book", link: "/profile/add-book", icon: <MdOutlineAddCircle className="text-lg" /> },
  ];

  const menuItems = role === "admin" ? adminMenuItems : userMenuItems;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-zinc-800 rounded-lg p-6 flex flex-col items-center justify-between h-full min-h-[70vh] border border-zinc-700 shadow-lg">
      <div className="flex flex-col items-center w-full">
        {/* Avatar & Role Badge */}
        <div className="relative">
          <img
            src={data.avatar || "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"}
            alt="Avatar"
            className="h-20 w-20 object-cover rounded-full border-2 border-zinc-600 bg-zinc-900"
          />
          {role === "admin" && (
            <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-zinc-900 text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <RiShieldUserFill className="text-xs" /> Admin
            </span>
          )}
        </div>

        <h3 className="mt-4 text-xl font-bold text-white text-center truncate w-full">
          {data.username || "Username"}
        </h3>
        <p className="mt-1 text-sm text-zinc-400 text-center truncate w-full">
          {data.email || "email@example.com"}
        </p>

        {/* Role pill */}
        <span
          className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full ${
            role === "admin"
              ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30"
              : "bg-blue-400/10 text-blue-400 border border-blue-400/30"
          }`}
        >
          {role === "admin" ? "Administrator" : "Member"}
        </span>

        <div className="w-full h-px bg-zinc-700 my-5" />

        {/* Menu Links */}
        <div className="flex flex-col gap-2 w-full">
          {menuItems.map((item, i) => (
            <Link
              key={i}
              to={item.link}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold flex items-center gap-3 transition-all duration-200 ${
                isActive(item.link)
                  ? "bg-yellow-400 text-zinc-900"
                  : "text-zinc-300 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full mt-8 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-400 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
      >
        <IoLogOutOutline className="text-xl" />
        Log Out
      </button>
    </div>
  );
};

export default Sidebar;