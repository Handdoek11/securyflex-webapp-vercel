"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Specialization {
  id: string;
  name: string;
  bonus: number;
}

const specializations: Specialization[] = [
  { id: "vip", name: "VIP beveiliging", bonus: 16 },
  { id: "event", name: "Event security", bonus: 9 },
  { id: "k9", name: "K9 unit", bonus: 22 },
];

export function EarningsCalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [baseRate, setBaseRate] = useState(26);
  const [weeks, setWeeks] = useState(4);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  const platformFee = 4.99;

  const maxBonus = selectedSpecializations.length > 0
    ? Math.max(...selectedSpecializations.map(id =>
        specializations.find(s => s.id === id)?.bonus || 0
      ))
    : 0;

  const effectiveRate = baseRate + maxBonus;
  const grossMonthly = hoursPerWeek * effectiveRate * weeks;
  const netMonthly = grossMonthly - platformFee;

  const handleSpecializationChange = (specId: string, checked: boolean) => {
    setSelectedSpecializations(prev =>
      checked
        ? [...prev, specId]
        : prev.filter(id => id !== specId)
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">💰 BEREKEN JE INKOMEN</CardTitle>
        <CardDescription>
          Zie direct hoeveel je kunt verdienen als ZZP beveiliger via SecuryFlex
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">VOER IN:</h3>

            <div className="space-y-2">
              <Label htmlFor="hours">Uren per week</Label>
              <Select value={hoursPerWeek.toString()} onValueChange={(v) => setHoursPerWeek(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 uur</SelectItem>
                  <SelectItem value="15">15 uur</SelectItem>
                  <SelectItem value="20">20 uur</SelectItem>
                  <SelectItem value="25">25 uur</SelectItem>
                  <SelectItem value="30">30 uur</SelectItem>
                  <SelectItem value="35">35 uur</SelectItem>
                  <SelectItem value="40">40 uur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Basisarief</Label>
              <Select value={baseRate.toString()} onValueChange={(v) => setBaseRate(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="22">€22/uur</SelectItem>
                  <SelectItem value="24">€24/uur</SelectItem>
                  <SelectItem value="26">€26/uur</SelectItem>
                  <SelectItem value="28">€28/uur</SelectItem>
                  <SelectItem value="30">€30/uur</SelectItem>
                  <SelectItem value="32">€32/uur</SelectItem>
                  <SelectItem value="35">€35/uur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeks">Weken per maand</Label>
              <Select value={weeks.toString()} onValueChange={(v) => setWeeks(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 weken</SelectItem>
                  <SelectItem value="4">4 weken</SelectItem>
                  <SelectItem value="5">5 weken</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Specialisaties:</Label>
              {specializations.map((spec) => (
                <div key={spec.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={spec.id}
                    checked={selectedSpecializations.includes(spec.id)}
                    onCheckedChange={(checked) =>
                      handleSpecializationChange(spec.id, checked as boolean)
                    }
                  />
                  <Label htmlFor={spec.id} className="cursor-pointer">
                    {spec.name} (+€{spec.bonus}/u)
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">JE VERDIENT:</h3>

            <div className="space-y-4 p-4 bg-secondary/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Bruto per maand:</span>
                <span className="text-xl font-bold">€{grossMonthly.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">SecuryFlex kosten:</span>
                <span className="text-muted-foreground">-€{platformFee.toFixed(2)}</span>
              </div>

              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Na kosten:</span>
                  <span className="text-2xl font-bold text-primary">€{netMonthly.toLocaleString()}</span>
                </div>
              </div>

              {maxBonus > 0 && (
                <div className="pt-2 border-t">
                  <div className="text-sm font-medium">MET SPECIALISATIES:</div>
                  <div className="text-lg font-bold text-accent">
                    Tot €{((hoursPerWeek * (baseRate + Math.max(...specializations.map(s => s.bonus))) * weeks) - platformFee).toLocaleString()}/maand mogelijk
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Badge variant="outline" className="text-xs">
                🏆 Top verdieners: €68/uur
              </Badge>
              <div className="text-xs text-muted-foreground">
                Gemiddelde ZZP beveiliger via SecuryFlex: €{netMonthly.toLocaleString()}/maand
                <br />
                Traditioneel: €1.800/maand
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}