"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface CountdownTimerProps {
  endTime: Date;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ endTime, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = endTime.getTime() - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [endTime]);

  if (isExpired) {
    return (
      <div className={`text-center ${className}`}>
        <Badge variant="destructive" className="text-sm">
          Aanbieding verlopen
        </Badge>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-center justify-center space-x-1 text-sm">
        <span className="text-muted-foreground">⏱️ Aanbod eindigt over:</span>
        <span className="font-mono font-bold text-accent">
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, "0")}:
          {String(timeLeft.minutes).padStart(2, "0")}:
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

// Helper component for creating a default countdown (3 days from now)
export function DefaultCountdown({ className = "" }: { className?: string }) {
  const endTime = new Date();
  endTime.setDate(endTime.getDate() + 3);
  endTime.setHours(14, 23, 45, 0); // 14:23:45

  return <CountdownTimer endTime={endTime} className={className} />;
}