"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Clock,
  Info,
  MapPin,
  Rocket,
  Save,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { OpdrachtgeverDashboardLayout } from "@/components/dashboard/OpdrachtgeverDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ShiftFormData {
  // Step 1 - Basic Info
  securityType: string;
  locationName: string;
  address: string;
  postalCode: string;
  riskProfile: string;
  instructions: string;
  contactName: string;
  contactPhone: string;

  // Step 2 - Planning
  shiftType: string;
  date: string;
  startTime: string;
  endTime: string;
  guardsNeeded: number;
  teamLeaderRequired: boolean;
  pauseRule: string;
  weekDays: string[];
  repeatUntil: string;

  // Step 3 - Requirements
  documents: string[];
  specializations: string[];
  languageNL: string;
  languageEN: string;
  minimumExperience: string;
  physicalRequirements: string[];

  // Step 4 - Budget
  pricingStrategy: string;
  hourlyRate: number;
  ortAllowance: boolean;
  travelAllowance: boolean;
  travelRate: number;
  maxDistance: number;
  mealAllowance: boolean;
  mealAmount: number;
  maxBudget: number;
  budgetAlert: boolean;
}

const initialFormData: ShiftFormData = {
  securityType: "Objectbeveiliging",
  locationName: "",
  address: "",
  postalCode: "",
  riskProfile: "Gemiddeld risico",
  instructions: "",
  contactName: "",
  contactPhone: "",

  shiftType: "Eenmalige shift",
  date: "",
  startTime: "",
  endTime: "",
  guardsNeeded: 2,
  teamLeaderRequired: false,
  pauseRule: "Standaard CAO pauze",
  weekDays: [],
  repeatUntil: "",

  documents: ["Beveiligingspas", "VOG"],
  specializations: [],
  languageNL: "Native",
  languageEN: "B1+",
  minimumExperience: "Minimaal 1 jaar ervaring",
  physicalRequirements: [],

  pricingStrategy: "Marktconform tarief",
  hourlyRate: 20.5,
  ortAllowance: true,
  travelAllowance: false,
  travelRate: 0.21,
  maxDistance: 50,
  mealAllowance: false,
  mealAmount: 15.0,
  maxBudget: 500,
  budgetAlert: true,
};

export default function NieuweShiftPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ShiftFormData>(initialFormData);
  const [showSuccess, setShowSuccess] = useState(false);
  const [estimatedMatches, _setEstimatedMatches] = useState(23);

  const progress = (currentStep / 5) * 100;

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      // In real app, this would save to localStorage or API
      console.log("Auto-saving draft...", formData);
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Calculate total hours
  const calculateHours = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    const start = new Date(`2024-01-01T${formData.startTime}`);
    const end = new Date(`2024-01-01T${formData.endTime}`);
    if (end <= start) return 0;
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    const hours = calculateHours();
    if (hours === 0) return 0;

    let hourlyTotal = formData.hourlyRate;
    hourlyTotal += 4.1; // Service fee
    if (formData.ortAllowance) hourlyTotal += 2.5; // ORT allowance
    if (formData.teamLeaderRequired) hourlyTotal += 3.0; // Team leader fee

    return formData.guardsNeeded * hours * hourlyTotal;
  };

  const updateFormData = (updates: Partial<ShiftFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const publishShift = () => {
    setShowSuccess(true);
  };

  const saveAsDraft = () => {
    // Save as draft logic
    alert("Shift bewaard als concept");
  };

  // Step 1 - Basic Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="securityType">TYPE BEVEILIGING *</Label>
        <Select
          value={formData.securityType}
          onValueChange={(value) => updateFormData({ securityType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Objectbeveiliging">Objectbeveiliging</SelectItem>
            <SelectItem value="Evenementbeveiliging">
              Evenementbeveiliging
            </SelectItem>
            <SelectItem value="Mobiele surveillance">
              Mobiele surveillance
            </SelectItem>
            <SelectItem value="Horecaportier">Horecaportier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="locationName">LOCATIE DETAILS *</Label>
        <Input
          id="locationName"
          placeholder="Terminal 2, Gate B"
          value={formData.locationName}
          onChange={(e) => updateFormData({ locationName: e.target.value })}
          className="mb-2"
        />
        <Input
          placeholder="Schiphol Airport"
          value={formData.address}
          onChange={(e) => updateFormData({ address: e.target.value })}
          className="mb-2"
        />
        <Input
          placeholder="1118 AA Schiphol"
          value={formData.postalCode}
          onChange={(e) => updateFormData({ postalCode: e.target.value })}
        />
      </div>

      <div>
        <Label>RISICOPROFIEL</Label>
        <RadioGroup
          value={formData.riskProfile}
          onValueChange={(value) => updateFormData({ riskProfile: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Laag risico" id="risk-low" />
            <Label htmlFor="risk-low">Laag risico</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Gemiddeld risico" id="risk-medium" />
            <Label htmlFor="risk-medium">Gemiddeld risico</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Hoog risico" id="risk-high" />
            <Label htmlFor="risk-high">Hoog risico</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Zeer hoog risico" id="risk-very-high" />
            <Label htmlFor="risk-very-high">
              Zeer hoog risico (extra vereisten)
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="instructions">INSTRUCTIES VOOR BEVEILIGERS</Label>
        <Textarea
          id="instructions"
          placeholder="Toegangscontrole bij Gate B. Speciale aandacht voor bagage controle..."
          value={formData.instructions}
          onChange={(e) => updateFormData({ instructions: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <Label>CONTACT TER PLAATSE</Label>
        <Input
          placeholder="Naam"
          value={formData.contactName}
          onChange={(e) => updateFormData({ contactName: e.target.value })}
          className="mb-2"
        />
        <Input
          placeholder="Telefoon"
          value={formData.contactPhone}
          onChange={(e) => updateFormData({ contactPhone: e.target.value })}
        />
      </div>
    </div>
  );

  // Step 2 - Planning
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label>SHIFT TYPE</Label>
        <RadioGroup
          value={formData.shiftType}
          onValueChange={(value) => updateFormData({ shiftType: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Eenmalige shift" id="shift-once" />
            <Label htmlFor="shift-once">Eenmalige shift</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Terugkerende shift" id="shift-recurring" />
            <Label htmlFor="shift-recurring">Terugkerende shift</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Project" id="shift-project" />
            <Label htmlFor="shift-project">Project (meerdere dagen)</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>DATUM & TIJD *</Label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => updateFormData({ date: e.target.value })}
          className="mb-2"
        />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) => updateFormData({ startTime: e.target.value })}
          />
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) => updateFormData({ endTime: e.target.value })}
          />
        </div>
        {calculateHours() > 0 && (
          <p className="text-sm text-muted-foreground">
            Totaal: {calculateHours()} uur
          </p>
        )}
      </div>

      <div>
        <Label>AANTAL BEVEILIGERS *</Label>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateFormData({
                guardsNeeded: Math.max(1, formData.guardsNeeded - 1),
              })
            }
          >
            -
          </Button>
          <span className="text-lg font-semibold">{formData.guardsNeeded}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateFormData({ guardsNeeded: formData.guardsNeeded + 1 })
            }
          >
            +
          </Button>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            checked={formData.teamLeaderRequired}
            onCheckedChange={(checked) =>
              updateFormData({ teamLeaderRequired: checked as boolean })
            }
          />
          <Label>Teamleider vereist (+€3/uur)</Label>
        </div>
      </div>

      <div>
        <Label>PAUZE REGELING</Label>
        <Select
          value={formData.pauseRule}
          onValueChange={(value) => updateFormData({ pauseRule: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Standaard CAO pauze">
              Standaard CAO pauze
            </SelectItem>
            <SelectItem value="Geen pauze">Geen pauze</SelectItem>
            <SelectItem value="Custom pauze">Custom pauze</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          30 min bij 8 uur dienst
        </p>
      </div>
    </div>
  );

  // Step 3 - Requirements
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label>VERPLICHTE DOCUMENTEN</Label>
        <div className="space-y-2">
          {[
            "Geldige beveiligingspas",
            "VOG (niet ouder dan 12 mnd)",
            "VCA Basis",
            "VCA VOL",
            "EHBO certificaat",
            "BHV certificaat",
          ].map((doc) => (
            <div key={doc} className="flex items-center space-x-2">
              <Checkbox
                checked={formData.documents.includes(doc)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFormData({ documents: [...formData.documents, doc] });
                  } else {
                    updateFormData({
                      documents: formData.documents.filter((d) => d !== doc),
                    });
                  }
                }}
                disabled={
                  doc === "Geldige beveiligingspas" ||
                  doc === "VOG (niet ouder dan 12 mnd)"
                }
              />
              <Label>
                {doc}{" "}
                {(doc === "Geldige beveiligingspas" ||
                  doc === "VOG (niet ouder dan 12 mnd)") &&
                  "✓"}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>SPECIALISATIES</Label>
        <div className="space-y-2">
          {[
            "Evenementbeveiliging",
            "Horecaportier",
            "Winkelsurveillance",
            "Persoonsbeveiliging",
            "Mobiele surveillance (rijbewijs)",
          ].map((spec) => (
            <div key={spec} className="flex items-center space-x-2">
              <Checkbox
                checked={formData.specializations.includes(spec)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFormData({
                      specializations: [...formData.specializations, spec],
                    });
                  } else {
                    updateFormData({
                      specializations: formData.specializations.filter(
                        (s) => s !== spec,
                      ),
                    });
                  }
                }}
              />
              <Label>{spec}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>TAALVAARDIGHEDEN</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Nederlands:</Label>
            <Select
              value={formData.languageNL}
              onValueChange={(value) => updateFormData({ languageNL: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Native">Native</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Engels:</Label>
            <Select
              value={formData.languageEN}
              onValueChange={(value) => updateFormData({ languageEN: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B1+">B1+</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <Label>MINIMUM ERVARING</Label>
        <Select
          value={formData.minimumExperience}
          onValueChange={(value) =>
            updateFormData({ minimumExperience: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Geen ervaring vereist">
              Geen ervaring vereist
            </SelectItem>
            <SelectItem value="Minimaal 1 jaar ervaring">
              Minimaal 1 jaar ervaring
            </SelectItem>
            <SelectItem value="Minimaal 2 jaar ervaring">
              Minimaal 2 jaar ervaring
            </SelectItem>
            <SelectItem value="Minimaal 3 jaar ervaring">
              Minimaal 3 jaar ervaring
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>FYSIEKE VEREISTEN</Label>
        <div className="space-y-2">
          {[
            "Langdurig staan (8+ uur)",
            "Tillen (25+ kg)",
            "Nachtdienst geschikt",
          ].map((req) => (
            <div key={req} className="flex items-center space-x-2">
              <Checkbox
                checked={formData.physicalRequirements.includes(req)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateFormData({
                      physicalRequirements: [
                        ...formData.physicalRequirements,
                        req,
                      ],
                    });
                  } else {
                    updateFormData({
                      physicalRequirements:
                        formData.physicalRequirements.filter((r) => r !== req),
                    });
                  }
                }}
              />
              <Label>{req}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 4 - Budget
  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <Label>TARIEF STRATEGIE</Label>
        <RadioGroup
          value={formData.pricingStrategy}
          onValueChange={(value) => updateFormData({ pricingStrategy: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Marktconform tarief" id="price-market" />
            <div>
              <Label htmlFor="price-market">
                Marktconform tarief (aanbevolen)
              </Label>
              <p className="text-sm text-muted-foreground">
                €19-22/uur voor deze functie
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Eigen tarief" id="price-custom" />
            <div>
              <Label htmlFor="price-custom">Eigen tarief instellen</Label>
              <p className="text-sm text-muted-foreground">
                Minimum: €18,00 Maximum: €25,00
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Bieden" id="price-bid" />
            <Label htmlFor="price-bid">Bieden (hoogste bieder wint)</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>UURTARIEF BEVEILIGER *</Label>
        <div className="flex items-center gap-2">
          <span>€</span>
          <Input
            type="number"
            step="0.50"
            value={formData.hourlyRate}
            onChange={(e) =>
              updateFormData({ hourlyRate: parseFloat(e.target.value) || 0 })
            }
            className="w-24"
          />
          <span>per uur</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Info className="h-4 w-4" />
          <span>Gemiddeld voor deze functie: €19,50 - €22,00</span>
        </div>
      </div>

      <div>
        <Label>TOESLAGEN</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.ortAllowance}
              onCheckedChange={(checked) =>
                updateFormData({ ortAllowance: checked as boolean })
              }
            />
            <div>
              <Label>ORT (Onregelmatigheidstoeslag)</Label>
              <p className="text-sm text-muted-foreground">
                Automatisch berekend volgens CAO
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.travelAllowance}
              onCheckedChange={(checked) =>
                updateFormData({ travelAllowance: checked as boolean })
              }
            />
            <Label>Reiskostenvergoeding</Label>
          </div>
          {formData.travelAllowance && (
            <div className="ml-6 grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.travelRate}
                  onChange={(e) =>
                    updateFormData({
                      travelRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0,21"
                />
                <Label className="text-xs">€/km</Label>
              </div>
              <div>
                <Input
                  type="number"
                  value={formData.maxDistance}
                  onChange={(e) =>
                    updateFormData({
                      maxDistance: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  placeholder="50"
                />
                <Label className="text-xs">max km</Label>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.mealAllowance}
              onCheckedChange={(checked) =>
                updateFormData({ mealAllowance: checked as boolean })
              }
            />
            <Label>Maaltijdvergoeding</Label>
          </div>
          {formData.mealAllowance && (
            <div className="ml-6 flex items-center gap-2">
              <span>€</span>
              <Input
                type="number"
                step="0.50"
                value={formData.mealAmount}
                onChange={(e) =>
                  updateFormData({
                    mealAmount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">
                bij 8+ uur dienst
              </span>
            </div>
          )}
        </div>
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold mb-3">KOSTEN OVERZICHT</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Uurtarief:</span>
            <span>€{formData.hourlyRate.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service fee:</span>
            <span>€4,10/uur</span>
          </div>
          <div className="flex justify-between">
            <span>Toeslagen:</span>
            <span>
              ~€
              {(formData.ortAllowance ? 2.5 : 0) +
                (formData.teamLeaderRequired ? 3.0 : 0)}
              /uur
            </span>
          </div>
          <hr className="border-dashed" />
          <div className="flex justify-between font-semibold">
            <span>Totaal per uur:</span>
            <span>
              €
              {(
                formData.hourlyRate +
                4.1 +
                (formData.ortAllowance ? 2.5 : 0) +
                (formData.teamLeaderRequired ? 3.0 : 0)
              ).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-green-600 pt-2">
            <span>Geschatte totaal:</span>
            <span>€{calculateTotalCost().toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <div>
        <Label>BUDGET LIMIET (optioneel)</Label>
        <div className="flex items-center gap-2 mb-2">
          <span>Maximum budget: €</span>
          <Input
            type="number"
            value={formData.maxBudget}
            onChange={(e) =>
              updateFormData({ maxBudget: parseFloat(e.target.value) || 0 })
            }
            className="w-24"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={formData.budgetAlert}
            onCheckedChange={(checked) =>
              updateFormData({ budgetAlert: checked as boolean })
            }
          />
          <Label>Waarschuw bij 80% budget</Label>
        </div>
      </div>
    </div>
  );

  // Step 5 - Review
  const renderStep5 = () => (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-3">SHIFT OVERZICHT</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              {formData.locationName}, {formData.address}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {formData.date} • {formData.startTime} - {formData.endTime} (
              {calculateHours()} uur)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{formData.guardsNeeded} beveiligers nodig</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span>{formData.securityType}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{formData.riskProfile}</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-3">VEREISTEN</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Documenten:</strong>
            <ul className="ml-4">
              {formData.documents.map((doc) => (
                <li key={doc}>• {doc} ✓</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Talen:</strong>
            <ul className="ml-4">
              <li>• Nederlands: {formData.languageNL}</li>
              <li>• Engels: {formData.languageEN}</li>
            </ul>
          </div>
          <div>
            <strong>Ervaring:</strong> {formData.minimumExperience}
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-green-50 border-green-200">
        <h3 className="font-semibold mb-3">KOSTEN</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Uurtarief:</span>
            <span>€{formData.hourlyRate.toFixed(2)}/uur</span>
          </div>
          <div className="flex justify-between">
            <span>Service fee:</span>
            <span>€4,10/uur</span>
          </div>
          {formData.ortAllowance && (
            <div className="flex justify-between">
              <span>ORT toeslag:</span>
              <span>€2,50/uur</span>
            </div>
          )}
          {formData.teamLeaderRequired && (
            <div className="flex justify-between">
              <span>Teamleider:</span>
              <span>€3,00/uur</span>
            </div>
          )}
          <hr className="border-dashed" />
          <div className="flex justify-between font-semibold">
            <span>Totaal per uur:</span>
            <span>
              €
              {(
                formData.hourlyRate +
                4.1 +
                (formData.ortAllowance ? 2.5 : 0) +
                (formData.teamLeaderRequired ? 3.0 : 0)
              ).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-green-600">
            <span>
              {formData.guardsNeeded} beveiligers × {calculateHours()} uur =
            </span>
            <span>€{calculateTotalCost().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-blue-600">
            <span>Geschatte matches:</span>
            <span>{estimatedMatches} beveiligers</span>
          </div>
        </div>
      </Card>

      {formData.instructions && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">INSTRUCTIES</h3>
          <p className="text-sm">"{formData.instructions}"</p>
          {formData.contactName && (
            <p className="text-sm text-muted-foreground mt-2">
              Contact: {formData.contactName} ({formData.contactPhone})
            </p>
          )}
        </Card>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  if (showSuccess) {
    return (
      <OpdrachtgeverDashboardLayout title="Shift Aanmaken" subtitle="">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md p-6 text-center">
            <div className="space-y-4">
              <div className="text-4xl">🎉</div>
              <h2 className="text-xl font-semibold">SHIFT GEPUBLICEERD! ✅</h2>
              <p className="text-muted-foreground">
                Je shift is succesvol gepubliceerd en wordt nu getoond aan
                geschikte beveiligers.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 justify-center">
                  <span>📊</span>
                  <span>
                    {estimatedMatches} beveiligers komen in aanmerking
                  </span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <span>🔔</span>
                  <span>15 notificaties verzonden</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <span>⏱️</span>
                  <span>Eerste reacties verwacht binnen 30 min</span>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Bekijk matches</Button>
                <Button variant="outline" className="flex-1">
                  Naar dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </OpdrachtgeverDashboardLayout>
    );
  }

  return (
    <OpdrachtgeverDashboardLayout
      title="Nieuwe Shift"
      subtitle={`Stap ${currentStep} van 5 - ${
        currentStep === 1
          ? "Basis informatie"
          : currentStep === 2
            ? "Planning"
            : currentStep === 3
              ? "Vereisten"
              : currentStep === 4
                ? "Budget & Tarief"
                : "Review & Bevestigen"
      }`}
      showBackButton={true}
    >
      <div className="p-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
        </div>

        {/* Step Content */}
        <div className="mb-6">{renderCurrentStep()}</div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Vorige
          </Button>

          <div className="flex gap-2">
            {currentStep === 5 && (
              <>
                <Button
                  variant="outline"
                  onClick={saveAsDraft}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Bewaar als concept
                </Button>
                <Button
                  onClick={publishShift}
                  className="flex items-center gap-2"
                >
                  <Rocket className="h-4 w-4" />
                  Publiceer shift
                </Button>
              </>
            )}

            {currentStep < 5 && (
              <Button onClick={nextStep} className="flex items-center gap-2">
                Volgende:{" "}
                {currentStep === 1
                  ? "Planning"
                  : currentStep === 2
                    ? "Vereisten"
                    : currentStep === 3
                      ? "Budget"
                      : "Review"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </OpdrachtgeverDashboardLayout>
  );
}
