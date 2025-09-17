"use client";

import { useState, useEffect } from "react";

interface TickerItem {
  id: number;
  text: string;
  location: string;
  rate: string;
  time: string;
}

const mockTickerItems: TickerItem[] = [
  {
    id: 1,
    text: "Event beveiliging",
    location: "Utrecht",
    rate: "€35/u",
    time: "start 20:00",
  },
  {
    id: 2,
    text: "Schiphol VIP",
    location: "Amsterdam",
    rate: "€42/u",
    time: "nu",
  },
  {
    id: 3,
    text: "Bouwplaats beveiliging",
    location: "Rotterdam",
    rate: "€28/u",
    time: "morgen 07:00",
  },
  {
    id: 4,
    text: "Winkel beveiliging",
    location: "Den Haag",
    rate: "€26/u",
    time: "weekend",
  },
];

export function LiveTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockTickerItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentItem = mockTickerItems[currentIndex];

  return (
    <div className="w-full bg-accent/10 border border-accent/20 rounded-lg px-4 py-2 animate-fade-in">
      <div className="flex items-center justify-center space-x-2 text-sm">
        <span className="animate-pulse text-accent">⚡</span>
        <span className="font-semibold text-accent">LIVE TICKER:</span>
        <span className="text-foreground">
          {currentItem.text} {currentItem.location}
        </span>
        <span className="font-semibold text-primary">{currentItem.rate}</span>
        <span className="text-muted-foreground">{currentItem.time}</span>
      </div>
    </div>
  );
}