"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react").then(mod => mod.default), { ssr: false });
const CountUp = dynamic(() => import("react-countup").then(mod => mod.default), { ssr: false });

export default function BikeInventoryLoader({ totalBikes = 0 }) {
  const [displayCount, setDisplayCount] = useState(0);
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/animations/bike-loader.json")
      .then(res => res.json())
      .then(data => setAnimationData(data));

    const timer = setTimeout(() => setDisplayCount(totalBikes), 500);
    return () => clearTimeout(timer);
  }, [totalBikes]);

  if (!animationData) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-900">
      <div className="w-48 h-48">
        <Lottie animationData={animationData} loop={true} />
      </div>
      <p className="mt-6 text-gray-700 text-lg">Loading inventory...</p>
      <p className="mt-2 text-2xl font-bold text-blue-600">
        <CountUp end={displayCount} duration={1.5} /> Bikes
      </p>
    </div>
  );
}
