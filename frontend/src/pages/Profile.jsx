import BASE_URL from "../api";
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Profile/Sidebar";
import { Outlet } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader/Loader";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/get-user-information`,
          { headers }
        );
        setProfileData(response.data);
      } catch (err) {
        setError("Failed to load profile information. Please log in again.");
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
      {!Profile && (
        <div className="w-full h-[100%] flex items-center justify-center">
        <Loader />
      </div>
      )}
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
