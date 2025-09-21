import { useEffect, useState } from "react";

export default function AnalyticsPageLoader() {
  const [numbers, setNumbers] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNumbers(numbers.map(() => Math.floor(Math.random() * 10)));
    }, 100);

    return () => clearInterval(interval);
  }, [numbers]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <div className="text-5xl font-mono flex space-x-2">
        {numbers.map((num, idx) => (
          <span key={idx} className="animate-pulse">{num}</span>
        ))}
      </div>
      <p className="text-gray-500 mt-4 text-lg">Crunching numbers...</p>
    </div>
  );
}
