import BASE_URL from "../../api";
import React, { useEffect, useState } from "react";
import axios from "axios";
import BookCard from "../BookCard/BookCard";
import Loader from "../Loader/Loader";

const Favourites = () => {
  const [favouriteBooks, setFavouriteBooks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/get-favourite-books`,
          { headers }
        );
        setFavouriteBooks(response.data.data);
      } catch (err) {
        setError("Failed to fetch favourite books.");
      } finally {
        setLoading(false);
      }
    };
    fetchFavourites();
  }, []);

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

  if (!favouriteBooks || favouriteBooks.length === 0) {
    return (
      <div className="h-[50vh] flex flex-col items-center justify-center text-zinc-500 gap-4">
        <p className="text-xl font-semibold">No Favourite Books Yet</p>
        <p className="text-sm">Start exploring and add books to your favourites!</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-yellow-100 mb-6">My Favourites</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favouriteBooks.map((book, i) => (
          <div key={i} className="flex">
            <BookCard data={book} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favourites;
