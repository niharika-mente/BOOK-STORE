import BASE_URL from "../api";
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Profile/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader/Loader";
import { useDispatch } from "react-redux";
import { authActions } from "../store/auth";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("id");

      // If no token/id, redirect to login immediately
      if (!token || !id) {
        dispatch(authActions.logout());
        navigate("/Login");
        return;
      }

      const headers = {
        id: id,
        authorization: `Bearer ${token}`,
      };

      try {
        const response = await axios.get(
          `${BASE_URL}/get-user-information`,
          { headers }
        );
        setProfileData(response.data);
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          // Token is expired or invalid — clear stale auth data and redirect
          localStorage.removeItem("id");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          dispatch(authActions.logout());
          navigate("/Login");
          return;
        }
        setError("Failed to load profile information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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

  return (
    <div className="bg-zinc-900 px-4 md:px-12 flex flex-col md:flex-row min-h-screen py-8 gap-6 text-white">
      {profileData && (
        <>
          <div className="w-full md:w-1/4 lg:w-1/5">
            <Sidebar data={profileData} />
          </div>

          <div className="w-full md:w-3/4 lg:w-4/5 bg-zinc-850 rounded-lg">
            <Outlet />
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
