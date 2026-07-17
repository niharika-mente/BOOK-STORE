import React from "react";
import { Link } from "react-router-dom";

const BookCard = ({ data }) => {
  return (
    <Link to={`/view-book-details/${data._id}`} className="w-full flex flex-col">
      <div className="bg-zinc-800 rounded p-4 flex flex-col justify-between h-full hover:bg-zinc-900 transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer">
        <div>
          <div className="bg-zinc-900 rounded flex items-center justify-center p-4">
            <img src={data.url} alt={data.title} className="h-[30vh] sm:h-[28vh] lg:h-[25vh] max-w-full object-contain" />
          </div>
          <h2 className="mt-4 text-xl text-white font-semibold leading-tight">{data.title}</h2>
          <p className="mt-2 text-zinc-400 font-semibold">by {data.author}</p>
        </div>
        <p className="mt-4 text-zinc-200 font-semibold text-xl">₹{data.price}</p>
      </div>
    </Link>
  );
};

export default BookCard;