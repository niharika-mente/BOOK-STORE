import BASE_URL from "../api";
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import BookCard from '../components/BookCard/BookCard'
import Loader from '../components/Loader/Loader'

const AllBooks = () => {
  const [Data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/get-all-books`
        );
        setData(response.data.data);
      } catch (err) {
        setError("Unable to load books. Please make sure the server is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="bg-zinc-900 min-h-screen px-4 sm:px-8 lg:px-12 py-8">
        <h4 className="text-2xl sm:text-3xl text-yellow-100">All Books</h4>
        {Data && Data.length > 0 && (
          <p className="text-zinc-500 mt-1 text-sm">{Data.length} books available</p>
        )}
        {loading && (
          <div className="flex items-center justify-center my-8">
            <Loader />
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center my-8">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        )}
        {Data && Data.length === 0 && (
          <div className="flex items-center justify-center my-8">
            <p className="text-zinc-400 text-lg">No books available.</p>
          </div>
        )}
        <div className="my-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Data &&
            Data.map((items, i) => (
              <div key={i} className="flex">
                <BookCard data={items} />
              </div>
            ))}
        </div>
    </div>
  )
}

export default AllBooks

