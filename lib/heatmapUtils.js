export function parseTimeRange(searchParams) {
  const now = new Date();
  const end = searchParams.get("end") ? new Date(searchParams.get("end")) : now;
  const start = searchParams.get("start")
    ? new Date(searchParams.get("start"))
    : new Date(end.getTime() - 24 * 3600 * 1000); // default last 24h
  const tauHours = Number(searchParams.get("tauHours") || 24); // decay horizon
  return { start, end, tauHours };
}

export function decayedWeight(eventTime, endTime, tauHours = 24, base = 1) {
  const dtHrs = (endTime - eventTime) / 3600000;
  const tau = Math.max(1e-3, tauHours);
  return base * Math.exp(-dtHrs / tau);
}
