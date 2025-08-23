"use client";

import { useJsApiLoader } from "@react-google-maps/api";

export default function GoogleMapsLoader({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "visualization", "marker"],
  });

  if (loadError) return <p>Error loading Google Maps</p>;
  if (!isLoaded) return <p>Loading Google Maps...</p>;

  return children;
}
