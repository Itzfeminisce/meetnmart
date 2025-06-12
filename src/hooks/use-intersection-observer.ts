import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  rootMargin?: string;
  onIntersect?: () => void;
  id?: string;
}

const VIEWED_ITEMS_KEY = 'viewed_items';

const getViewedItems = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  const stored = sessionStorage.getItem(VIEWED_ITEMS_KEY);
  return new Set(stored ? JSON.parse(stored) : []);
};

const addViewedItem = (id: string) => {
  if (typeof window === 'undefined') return;
  const viewedItems = getViewedItems();
  viewedItems.add(id);
  sessionStorage.setItem(VIEWED_ITEMS_KEY, JSON.stringify([...viewedItems]));
};

export const useIntersectionObserver = <T extends HTMLElement>({
  threshold = 0.1,
  rootMargin = '0px',
  onIntersect,
  id,
}: UseIntersectionObserverProps = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !id) return;

    // Check if already viewed in this session
    const viewedItems = getViewedItems();
    if (viewedItems.has(id)) {
      hasTriggeredRef.current = true;
      return;
    }

    // Cleanup previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          // Set a timeout to trigger the callback after 1 second of continuous visibility
          timeoutRef.current = setTimeout(() => {
            if (!hasTriggeredRef.current) {
              onIntersect?.();
              hasTriggeredRef.current = true;
              addViewedItem(id);
              
              if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
              }
            }
          }, 1000); // Wait for 1 second of continuous visibility
        } else if (!entry.isIntersecting) {
          // Clear the timeout if the element is no longer visible
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [threshold, rootMargin, onIntersect, id]);

  return { elementRef, isIntersecting };
}; 