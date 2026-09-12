import React, { useEffect } from "react";
import Hero from "../components/Home/Hero";
import RecentlyAdded from "../components/Home/RecentlyAdded";
import AIRecommendations from "../components/Home/AIRecommendations";

const Home = () => {
  useEffect(() =>{
    window.scrollTo(0,0)
  },[]);
  return (
    <div className="bg-zinc-900 text-white px-10 py-8">
      <Hero />
      <RecentlyAdded />
      <AIRecommendations />
    </div>
  );
};

export default Home;