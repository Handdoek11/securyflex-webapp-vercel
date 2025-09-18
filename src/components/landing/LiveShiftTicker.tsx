"use client";

import { Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Shift {
  id: string;
  location: string;
  time: string;
  duration: string;
  rate: number;
  type: string;
  urgent?: boolean;
}

// Mock data - in production this would come from an API
const mockShifts: Shift[] = [
  {
    id: "1",
    location: "Amsterdam Arena",
    time: "20:00",
    duration: "6u",
    rate: 32,
    type: "Evenement",
    urgent: true,
  },
  {
    id: "2",
    location: "Rotterdam Haven",
    time: "22:00",
    duration: "8u",
    rate: 30,
    type: "Bouwplaats",
  },
  {
    id: "3",
    location: "Utrecht CS",
    time: "06:00",
    duration: "4u",
    rate: 28,
    type: "Station",
  },
  {
    id: "4",
    location: "Den Haag Centrum",
    time: "18:00",
    duration: "5u",
    rate: 29,
    type: "Winkelcentrum",
  },
  {
    id: "5",
    location: "Schiphol Airport",
    time: "00:00",
    duration: "8u",
    rate: 35,
    type: "Luchthaven",
    urgent: true,
  },
  {
    id: "6",
    location: "Eindhoven PSV Stadion",
    time: "19:00",
    duration: "5u",
    rate: 31,
    type: "Evenement",
  },
  {
    id: "7",
    location: "Groningen Universiteit",
    time: "08:00",
    duration: "8u",
    rate: 27,
    type: "Onderwijs",
  },
  {
    id: "8",
    location: "Tilburg Festival",
    time: "14:00",
    duration: "10u",
    rate: 30,
    type: "Festival",
  },
];

export function LiveShiftTicker() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Initialize with mock data
    setShifts([...mockShifts, ...mockShifts]); // Duplicate for seamless loop

    // Restart animation when it completes
    const interval = setInterval(() => {
      setAnimationKey((prev) => prev + 1);
    }, 30000); // Restart every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 to-primary/10 py-4">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

      <div className="flex items-center">
        <div className="flex items-center bg-primary text-white px-4 py-2 rounded-r-full mr-4 z-20">
          <div className="animate-pulse mr-2 w-2 h-2 bg-white rounded-full" />
          <span className="font-semibold text-sm">LIVE SHIFTS</span>
        </div>

        <div key={animationKey} className="flex gap-4 animate-scroll">
          {shifts.map((shift, index) => (
            <div
              key={`${shift.id}-${index}`}
              className={cn(
                "flex-shrink-0 bg-white rounded-lg p-3 shadow-sm border min-w-[280px]",
                shift.urgent && "border-orange-500 bg-orange-50",
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  {shift.urgent && (
                    <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full mb-1 inline-block">
                      URGENT
                    </span>
                  )}
                  <div className="font-semibold text-sm">{shift.type}</div>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {shift.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    €{shift.rate}/u
                  </div>
                  <div className="text-xs text-muted-foreground">
                    €{shift.rate * parseInt(shift.duration, 10)},-
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {shift.time} • {shift.duration}
                </div>
                <button className="text-primary font-semibold hover:underline">
                  Bekijk →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
