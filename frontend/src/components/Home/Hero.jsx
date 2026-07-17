import React from 'react';
import hero from "../../assets/hero.png";
import { Link } from 'react-router-dom';
const Hero = () => {
  return (
    <div className="h-screen md:h-[75vh] flex flex-col md:flex-row items-center justify-center">
      <div className="w-full mb-12 md:mb-0 lg:w-3/6 flex flex-col items-center lg:items-start justify-center">
        <h1 className="text-4xl lg:text-6xl font-semibold text-yellow-100 text-center lg:text-left">
          A World of Stories,<br /> One Click Away
        </h1>
        <p className="mt-4 text-xl text-zinc-300 text-center lg:text-left">
         From timeless classics to modern bestsellers, discover books that inspire, entertain, and transform your perspective.  
        </p>
        <div className="mt-8">
          <Link to="/all-books" className="text-yellow-100 text-xl lg:text-2xl font-semibold border border-yellow-100 px-10 py-3 hover:bg-zinc-800 rounded-full">
          Explore Books
        </Link>
        </div>
      </div>
      <div className="w-full lg:w-3/6 h-auto lg:h-full flex items-center justify-center">
        <img src={hero} alt="hero"/>
        </div>
</div>
  );
};

export default Hero;