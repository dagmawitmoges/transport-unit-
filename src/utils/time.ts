/**
 * Request times are wall-clock times of day (the API serialises them as
 * 2000-01-01THH:MM:SS+03:00), so read HH:MM as sent instead of converting
 * through the browser's timezone.
 */
export const formatTime = (iso?: string | null) => {
  const match = iso?.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : '—';
};
