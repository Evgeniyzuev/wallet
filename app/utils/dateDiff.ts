export const getDaysBetweenDates = (date1: Date, date2: Date): number => {
  // Reset time to 00:00:00 for both dates
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / oneDay);
};
