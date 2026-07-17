import React, { useEffect } from "react";
import Home from "./pages/Home";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { Routes, Route } from "react-router-dom";
import AllBooks from "./pages/AllBooks";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import ViewBookDetails from "./components/ViewBookDetails/ViewBookDetails";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "./store/auth";

// User profile sections
import Favourites from "./components/Profile/Favourites";
import OrderHistory from "./components/Profile/OrderHistory";
import Settings from "./components/Profile/Settings";

// Admin profile sections
import AllOrders from "./components/Profile/AllOrders";
import AddBook from "./components/Profile/AddBook";

const App = () => {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.role);

  useEffect(() => {
    if (
      localStorage.getItem("id") &&
      localStorage.getItem("token") &&
      localStorage.getItem("role")
    ) {
      dispatch(authActions.login());
      dispatch(authActions.changeRole(localStorage.getItem("role")));
    }
  }, []);

  return (
    <div>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/all-books" element={<AllBooks />} />
        <Route path="/cart" element={<Cart />} />

        {/* Profile — index route shows different content per role */}
        <Route path="/profile" element={<Profile />}>
          {/* Admin routes */}
          <Route index element={role === "admin" ? <AllOrders /> : <Favourites />} />
          <Route path="/profile/add-book" element={<AddBook />} />

          {/* User routes */}
          <Route path="/profile/orderHistory" element={<OrderHistory />} />
          <Route path="/profile/settings" element={<Settings />} />
        </Route>

        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/view-book-details/:id" element={<ViewBookDetails />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;