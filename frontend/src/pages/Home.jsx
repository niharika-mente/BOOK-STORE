import React, { useEffect } from "react";
import Hero from "../components/Home/Hero";
import RecentlyAdded from "../components/Home/RecentlyAdded";

const Home = () => {
  useEffect(() =>{
    window.scrollTo(0,0)
  },[]);
  return (
    <div className="bg-zinc-900 text-white px-10 py-8">
      <Hero />
      <RecentlyAdded />
    </div>
  );
};

export default Home;