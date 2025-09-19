// ~0.0025 degrees ≈ 277 m at equator (adjust to your city)
const GRID = 0.0025;

export function cellId(lat, lng, size = GRID) {
  const rLat = Math.floor(lat / size) * size;
  const rLng = Math.floor(lng / size) * size;
  return `${rLat.toFixed(4)},${rLng.toFixed(4)}`;
}

export function cellCenter(id) {
  const [lat, lng] = id.split(",").map(parseFloat);
  return { lat: lat + GRID / 2, lng: lng + GRID / 2 };
}
