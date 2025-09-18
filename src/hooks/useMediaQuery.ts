"use client";

import { useEffect, useState } from "react";

/**
 * Hook that returns true if the given media query matches
 * @param query - Media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Define the listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

// Predefined breakpoints matching Tailwind config
export const breakpoints = {
  xs: "(min-width: 475px)",
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
  "3xl": "(min-width: 1920px)",
} as const;

// Helper hooks for common breakpoints
export const useIsXs = () => useMediaQuery(breakpoints.xs);
export const useIsSm = () => useMediaQuery(breakpoints.sm);
export const useIsMd = () => useMediaQuery(breakpoints.md);
export const useIsLg = () => useMediaQuery(breakpoints.lg);
export const useIsXl = () => useMediaQuery(breakpoints.xl);
export const useIs2xl = () => useMediaQuery(breakpoints["2xl"]);
export const useIs3xl = () => useMediaQuery(breakpoints["3xl"]);
