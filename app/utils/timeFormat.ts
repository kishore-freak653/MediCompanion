/**
 * Time formatting utilities for displaying times in 12-hour format (AM/PM).
 */

/**
 * Converts 24-hour time string (HH:MM or HH:MM:SS) to 12-hour format (h:MM AM/PM).
 * @param time24 - Time in 24-hour format (e.g., "14:30" or "09:05")
 * @returns Time in 12-hour format (e.g., "2:30 PM" or "9:05 AM")
 */
export function formatTime12Hour(time24: string): string {
  if (!time24 || typeof time24 !== "string") return time24;
  
  // Extract hours and minutes (handle HH:MM or HH:MM:SS)
  const [hoursStr, minutesStr] = time24.split(":");
  if (!hoursStr || !minutesStr) return time24;
  
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  if (isNaN(hours) || isNaN(minutes)) return time24;
  
  // Convert to 12-hour format
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${hours12}:${minutesStr.padStart(2, "0")} ${period}`;
}

/**
 * Formats time for display with optional label.
 * @param time24 - Time in 24-hour format
 * @param prefix - Optional prefix (e.g., "Due by")
 * @returns Formatted string (e.g., "Due by 2:30 PM")
 */
export function formatTimeDisplay(time24: string, prefix?: string): string {
  const formatted = formatTime12Hour(time24);
  return prefix ? `${prefix} ${formatted}` : formatted;
}
