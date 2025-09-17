"use client";

import { useMediaQuery } from "./useMediaQuery";

export type DeviceType = "mobile" | "tablet" | "desktop" | "largeDesktop";

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isMobileOnly: boolean;
  isTabletOnly: boolean;
  isDesktopOnly: boolean;
  isMobileOrTablet: boolean;
  isTabletOrDesktop: boolean;
  deviceType: DeviceType;
  isTouch: boolean;
}

/**
 * Hook that provides comprehensive responsive state information
 * @returns Object with device type flags and current device type
 */
export function useResponsive(): ResponsiveState {
  // Media query checks
  const isSmUp = useMediaQuery("(min-width: 640px)");
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const isLgUp = useMediaQuery("(min-width: 1024px)");
  const isXlUp = useMediaQuery("(min-width: 1280px)");
  const is2xlUp = useMediaQuery("(min-width: 1536px)");

  // Touch detection
  const isTouch = useMediaQuery("(hover: none) and (pointer: coarse)");

  // Device type calculations
  const isMobile = !isMdUp;
  const isTablet = isMdUp && !isLgUp;
  const isDesktop = isLgUp && !is2xlUp;
  const isLargeDesktop = is2xlUp;

  // Exclusive device types (only true for specific range)
  const isMobileOnly = !isMdUp;
  const isTabletOnly = isMdUp && !isLgUp;
  const isDesktopOnly = isLgUp && !is2xlUp;

  // Combined device types
  const isMobileOrTablet = !isLgUp;
  const isTabletOrDesktop = isMdUp;

  // Determine current device type
  let deviceType: DeviceType = "mobile";
  if (is2xlUp) deviceType = "largeDesktop";
  else if (isLgUp) deviceType = "desktop";
  else if (isMdUp) deviceType = "tablet";

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isMobileOnly,
    isTabletOnly,
    isDesktopOnly,
    isMobileOrTablet,
    isTabletOrDesktop,
    deviceType,
    isTouch,
  };
}

/**
 * Hook that returns true only on mobile devices
 */
export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 768px)");
}

/**
 * Hook that returns true only on tablet devices
 */
export function useIsTablet(): boolean {
  const isMdUp = useMediaQuery("(min-width: 768px)");
  const isLgUp = useMediaQuery("(min-width: 1024px)");
  return isMdUp && !isLgUp;
}

/**
 * Hook that returns true on desktop and larger
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

/**
 * Hook that returns true for touch devices
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery("(hover: none) and (pointer: coarse)");
}