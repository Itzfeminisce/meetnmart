import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with clsx and optimizes them with twMerge
 * This allows for conditional className usage that properly handles Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gets the initials from a name
 * @param name - Full name to extract initials from
 * @returns The first letter of each word in the name
 */
export function getInitials(name: string): string {
  if (!name) return "";

  return name
    .replace(/[^\p{L}\s]/gu, '') // remove non-letter characters, including emojis
    .split(/\s+/) // split by spaces
    .filter(Boolean) // remove empty strings
    .slice(0, 2) // get first two name parts
    .map(part => part[0].toUpperCase())
    .join('');
}

/**
 * Formats seconds into a MM:SS format
 * @param seconds - Total seconds
 * @returns Formatted string in MM:SS
 */

export function formatDate(
  dateString: string | Date,
  options: {
    dateStyle?: 'full' | 'long' | 'medium' | 'short',
    timeStyle?: 'full' | 'long' | 'medium' | 'short',
    timeZone?: string
  } = {}
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

  // Default options
  const defaultOptions: Intl.DateTimeFormatOptions = {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'UTC',
    ...options
  };

  return new Intl.DateTimeFormat('en-US', {
    ...defaultOptions,
    hour12: true // Use AM/PM format
  }).format(date);
}

export function formatDuration(input: number | string): string {
  if (typeof input === 'string') {
    // If already in a time format (e.g., "01:23" or "00:10:15")
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(input)) {
      return input;
    }

    // If it's a Postgres interval string (e.g., "01:23:45" or "00:10:00")
    const parts = input.split(':').map(Number);
    if (parts.length === 3) {
      const [hours, mins, secs] = parts;
      const totalMinutes = hours * 60 + mins;
      return `${hours}h ${mins}m`;
    }
  }

  // Treat numeric input as seconds
  const seconds = Number(input);
  if (isNaN(seconds) || seconds < 0) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeAgo(
  input: Date | string | number,
  locale: string = "en"
): string {
  const now = new Date();
  const date = new Date(input);
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const ranges: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60 * 60, "minute"],
    [60 * 60 * 24, "hour"],
    [60 * 60 * 24 * 7, "day"],
    [60 * 60 * 24 * 30, "week"],
    [60 * 60 * 24 * 365, "month"],
    [Infinity, "year"]
  ];

  let divisor = 1;
  let unit: Intl.RelativeTimeFormatUnit = "second";

  for (const [threshold, u] of ranges) {
    if (Math.abs(diffInSeconds) < threshold) {
      unit = u;
      break;
    }
    divisor = threshold;
  }

  const value = Math.round(diffInSeconds / divisor);
  return rtf.format(value, unit);
}


export const getEnvVar = (key: string): string => {
  const value = import.meta.env[`${key.startsWith("VITE_") ? key : `VITE_${key}`}`];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export function toLivekitRoomName(input: string): string {
  return input
    .toLowerCase() // optional: normalize case
    .replace(/[^a-z0-9_-]+/gi, '-') // replace invalid chars with hyphen
    .replace(/^-+|-+$/g, '')        // trim leading/trailing hyphens
    .replace(/-{2,}/g, '-')         // collapse multiple hyphens
    .slice(0, 512);                 // enforce max length
}



// Format currency
export const formatCurrency = (amount: number, currency: string = 'NGN') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};



const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};


export const logger = (message?: any, ...optionalParams: any[]) => {
const env = getEnvVar("NODE_ENV")

if(env === "production") return;

console.log(message, optionalParams)
}