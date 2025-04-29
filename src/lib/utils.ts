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
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

/**
 * Formats seconds into a MM:SS format
 * @param seconds - Total seconds
 * @returns Formatted string in MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}