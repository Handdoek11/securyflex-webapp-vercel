"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Euro,
  Shield,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileText,
  Save,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BedrijfDashboardLayout } from "@/components/dashboard/BedrijfDashboardLayout";

interface ShiftRequirement {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  beveiligers: number;
}

export default function BedrijfOpdrachtPlaatsenPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enableDirectPayment, setEnableDirectPayment] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [hourlyRate, setHourlyRate] = useState("25");
  const [requirements, setRequirements] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  // Shifts
  const [shifts, setShifts] = useState<ShiftRequirement[]>([
    {
      id: "1",
      date: "",
      startTime: "",
      endTime: "",
      beveiligers: 1
    }
  ]);

  const addShift = () => {
    setShifts([
      ...shifts,
      {
        id: Date.now().toString(),
        date: "",
        startTime: "",
        endTime: "",
        beveiligers: 1
      }
    ]);
  };

  const removeShift = (id: string) => {
    if (shifts.length > 1) {
      setShifts(shifts.filter(s => s.id !== id));
    }
  };

  const updateShift = (id: string, field: keyof ShiftRequirement, value: string | number) => {
    setShifts(shifts.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const calculateTotalValue = () => {
    return shifts.reduce((total, shift) => {
      if (shift.startTime && shift.endTime) {
        const start = parseInt(shift.startTime.split(":")[0]);
        const end = parseInt(shift.endTime.split(":")[0]);
        const hours = end > start ? end - start : 0;
        return total + (hours * shift.beveiligers * parseFloat(hourlyRate || "0"));
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard/bedrijf/opdrachten");
    }, 1500);
  };

  const availableSkills = [
    "Evenement",
    "Object Beveiliging",
    "Receptie",
    "VIP Begeleiding",
    "Crowd Control",
    "Airport Security",
    "Engels",
    "EHBO",
    "BHV"
  ];

  return (
    <BedrijfDashboardLayout
      title="Nieuwe Opdracht Plaatsen"
      subtitle="Plaats een opdracht voor ZZP beveiligers"
      headerActions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit(true)}>
            <Save className="h-4 w-4 mr-2" />
            Concept opslaan
          </Button>
          <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            Opdracht plaatsen
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Finqle Status */}
        <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900 dark:text-green-100">
                Finqle Direct Payment beschikbaar
              </p>
              <p className="text-sm text-green-700 dark:text-green-200">
                ZZP'ers kunnen kiezen voor directe uitbetaling binnen 24 uur. Kredietlimiet: €80.000 beschikbaar.
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Basis Informatie
          </h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Opdracht Titel *</Label>
              <Input
                id="title"
                placeholder="Bijv. Evenement Beveiliging RAI"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categorie *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecteer categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="evenement">Evenement</SelectItem>
                    <SelectItem value="object">Object Beveiliging</SelectItem>
                    <SelectItem value="receptie">Receptie/Portier</SelectItem>
                    <SelectItem value="surveillance">Surveillance</SelectItem>
                    <SelectItem value="vip">VIP Begeleiding</SelectItem>
                    <SelectItem value="anders">Anders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rate">Uurtarief (€) *</Label>
                <Input
                  id="rate"
                  type="number"
                  min="20"
                  step="0.50"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Locatie *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  className="pl-9"
                  placeholder="Straat, Stad"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Omschrijving</Label>
              <Textarea
                id="description"
                placeholder="Beschrijf de werkzaamheden..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Shifts */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Shifts
          </h3>

          <div className="space-y-3">
            {shifts.map((shift, index) => (
              <div key={shift.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Shift {index + 1}</span>
                  {shifts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeShift(shift.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label>Datum</Label>
                    <Input
                      type="date"
                      value={shift.date}
                      onChange={(e) => updateShift(shift.id, "date", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Start</Label>
                    <Input
                      type="time"
                      value={shift.startTime}
                      onChange={(e) => updateShift(shift.id, "startTime", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Eind</Label>
                    <Input
                      type="time"
                      value={shift.endTime}
                      onChange={(e) => updateShift(shift.id, "endTime", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Beveiligers</Label>
                    <Input
                      type="number"
                      min="1"
                      value={shift.beveiligers}
                      onChange={(e) => updateShift(shift.id, "beveiligers", parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={addShift}
          >
            <Plus className="h-4 w-4 mr-2" />
            Shift toevoegen
          </Button>
        </Card>

        {/* Requirements & Skills */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Vereisten & Vaardigheden
          </h3>

          <div className="space-y-4">
            <div>
              <Label>Vereiste Vaardigheden</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={skills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (skills.includes(skill)) {
                        setSkills(skills.filter(s => s !== skill));
                      } else {
                        setSkills([...skills, skill]);
                      }
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="requirements">Aanvullende Vereisten</Label>
              <Textarea
                id="requirements"
                placeholder="Bijv. VOG vereist, eigen vervoer, etc."
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Instellingen</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="direct-payment">Finqle Direct Payment</Label>
                  <Badge variant="success" className="text-xs">Aanbevolen</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sta ZZP'ers toe om directe betaling aan te vragen
                </p>
              </div>
              <Switch
                id="direct-payment"
                checked={enableDirectPayment}
                onCheckedChange={setEnableDirectPayment}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-accept">Automatisch accepteren</Label>
                <p className="text-sm text-muted-foreground">
                  Accepteer automatisch de eerste {shifts.reduce((sum, s) => sum + s.beveiligers, 0)} sollicitaties
                </p>
              </div>
              <Switch
                id="auto-accept"
                checked={autoAccept}
                onCheckedChange={setAutoAccept}
              />
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <h3 className="text-lg font-semibold mb-4">Samenvatting</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Totaal shifts:</span>
              <span className="font-medium">{shifts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Totaal beveiligers:</span>
              <span className="font-medium">
                {shifts.reduce((sum, s) => sum + s.beveiligers, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uurtarief:</span>
              <span className="font-medium">€{hourlyRate}/uur</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Geschatte totale waarde:</span>
              <span>€{calculateTotalValue().toLocaleString("nl-NL")}</span>
            </div>
          </div>

          {enableDirectPayment && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700 dark:text-green-300">
                  Direct payment via Finqle beschikbaar voor deze opdracht
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Annuleren
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSubmit(true)}>
              <Save className="h-4 w-4 mr-2" />
              Concept opslaan
            </Button>
            <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Bezig..." : "Opdracht plaatsen"}
            </Button>
          </div>
        </div>
      </div>
    </BedrijfDashboardLayout>
  );
}