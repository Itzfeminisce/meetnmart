import { useState, useEffect } from 'react';


export const STORAGE_KEY = "____x-meetnmart_"
/**
 * A hook for managing state in localStorage with a base prefix
 * 
 * @param key - The localStorage key (will be prefixed with base ID)
 * @param initialValue - Optional initial value to use if no value is found in localStorage
 * @returns An object containing the stored value and functions to update, delete, and clear it
 */
export function useLocalStorage<T>(
  key: string,
  initialValue?: T
): {
  value: T;
  setValue: (value: T | ((val: T) => T)) => void;
  deleteValue: () => void;
  clear: () => void;
} {
  // Base prefix for all localStorage keys
  const BASE_PREFIX = STORAGE_KEY


  // Get from local storage then parse stored json or return initialValue
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue as T;
    }

    try {
      // Get the entire paymate object or create a new one if it doesn't exist
      const paymateStorage = JSON.parse(window.localStorage.getItem(BASE_PREFIX) || '{}');
      // Return the specific key from the paymate object or the initial value
      return key in paymateStorage ? paymateStorage[key] as T : initialValue as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${BASE_PREFIX}.${key}":`, error);
      return initialValue as T;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(prevValue => {
        // If the value is an object, merge with previous value
        if (typeof prevValue === 'object' && prevValue !== null &&
          typeof valueToStore === 'object' && valueToStore !== null) {
          return { ...prevValue, ...valueToStore } as T;
        }
        return valueToStore;
      });

      // Save to local storage
      if (typeof window !== 'undefined') {
        // Get the current paymate object
        const paymateStorage = JSON.parse(window.localStorage.getItem(BASE_PREFIX) || '{}');

        // If the stored value is an object, merge with new value
        if (key in paymateStorage &&
          typeof paymateStorage[key] === 'object' && paymateStorage[key] !== null &&
          typeof valueToStore === 'object' && valueToStore !== null) {
          paymateStorage[key] = { ...paymateStorage[key], ...valueToStore };
        } else {
          // Otherwise just set the value
          paymateStorage[key] = valueToStore;
        }

        // Save the entire object back to localStorage
        window.localStorage.setItem(BASE_PREFIX, JSON.stringify(paymateStorage));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${BASE_PREFIX}.${key}":`, error);
    }
  };

  // delete from local storage
  const deleteValue = () => {
    if (typeof window !== 'undefined') {
      try {
        // Get the current paymate object
        const paymateStorage = JSON.parse(window.localStorage.getItem(BASE_PREFIX) || '{}');
        // Delete the specific key
        delete paymateStorage[key];
        // Save the entire object back to localStorage
        window.localStorage.setItem(BASE_PREFIX, JSON.stringify(paymateStorage));
        // Update state to reflect deletion
        setStoredValue(initialValue as T);
      } catch (error) {
        console.warn(`Error deleting localStorage key "${BASE_PREFIX}.${key}":`, error);
      }
    }
  };

  // clear function to remove all data with the BASE_PREFIX
  const clear = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(BASE_PREFIX);
    }
  };

  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === BASE_PREFIX && e.newValue) {
        try {
          const newPaymateStorage = JSON.parse(e.newValue);
          if (key in newPaymateStorage) {
            setStoredValue(newPaymateStorage[key]);
          } else if (storedValue !== initialValue) {
            // If the key was deleted in another tab
            setStoredValue(initialValue as T);
          }
        } catch (error) {
          console.warn(`Error handling storage event for "${BASE_PREFIX}.${key}":`, error);
        }
      }
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue, storedValue]);

  return {
    value: storedValue,
    setValue,
    deleteValue,
    clear
  };
}


/**
 * Use cases for the useLocalStorage hook:
 *
 * 1. User Preferences:
 *    - Store theme preferences (dark/light mode)
 *    - Store UI layout preferences
 *    - Remember language selection
 *
 * 2. User Session Data:
 *    - Cache user profile information (as seen in Dashboard.tsx)
 *    - Store authentication tokens with expiry
 *    - Remember last visited page for returning users
 *
 * 3. Form Persistence:
 *    - Save form drafts to prevent data loss
 *    - Remember form inputs between sessions
 *    - Store multi-step form progress
 *
 * 4. Application State:
 *    - Maintain shopping cart contents between sessions
 *    - Save filter/sort preferences for lists
 *    - Store pagination state
 *
 * 5. Offline Capabilities:
 *    - Cache API responses for offline access
 *    - Queue actions to be performed when back online
 *    - Store draft content for offline creation
 *
 * 6. Performance Optimization:
 *    - Cache expensive calculations
 *    - Store recently viewed items
 *    - Prefetch and store commonly accessed data
 *
 * Example usage with user data:
 * ```tsx
 * // Store complete user profile
 * const { value: user, setValue: setUser, deleteValue: deleteUser } = useLocalStorage<User | null>('user', null);
 *
 * // Access and update specific user properties
 * const updateUserName = (newName: string) => {
 *   setUser(prevUser => prevUser ? { ...prevUser, name: newName } : null);
 * };
 *
 * // Store user referral link (as seen in Dashboard.tsx)
 * useEffect(() => {
 *   if (wallet?.referral_id) {
 *     setUser(prevUser => ({
 *       ...prevUser,
 *       referral_link: `${window.location.origin}/sign-up?ref=${wallet.referral_id}`
 *     }));
 *   }
 * }, [wallet?.referral_id]);
 *
 * // Clear user data on logout
 * const handleLogout = () => {
 *   deleteUser();
 *   navigate('/login');
 * };
 * ```
 */

// whatkey in the local storage?
// __paymate_user

// what is the initial value?
// null
