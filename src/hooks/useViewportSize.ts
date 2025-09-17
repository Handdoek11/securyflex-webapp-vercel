"use client";

import { useState, useEffect } from "react";

interface ViewportSize {
  width: number;
  height: number;
  isPortrait: boolean;
  isLandscape: boolean;
}

/**
 * Hook that tracks viewport size and orientation
 * @returns Object with width, height, and orientation information
 */
export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>({
    width: 0,
    height: 0,
    isPortrait: false,
    isLandscape: false,
  });

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === "undefined") {
      return;
    }

    // Handler to update size
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setSize({
        width,
        height,
        isPortrait: height > width,
        isLandscape: width > height,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener with debounce
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener("resize", debouncedResize);
    window.addEventListener("orientationchange", handleResize);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return size;
}

/**
 * Hook that returns only the viewport width
 */
export function useViewportWidth(): number {
  const { width } = useViewportSize();
  return width;
}

/**
 * Hook that returns only the viewport height
 */
export function useViewportHeight(): number {
  const { height } = useViewportSize();
  return height;
}

/**
 * Hook that returns true if viewport is in portrait orientation
 */
export function useIsPortrait(): boolean {
  const { isPortrait } = useViewportSize();
  return isPortrait;
}

/**
 * Hook that returns true if viewport is in landscape orientation
 */
export function useIsLandscape(): boolean {
  const { isLandscape } = useViewportSize();
  return isLandscape;
}