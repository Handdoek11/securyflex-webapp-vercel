"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Building,
  MapPin,
  Users,
  FileText,
  CheckCircle,
  MessageCircle,
  Book,
  ChevronRight,
  AlertTriangle,
  Star,
  Download,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OpdrachtgeverDashboardLayout } from "@/components/dashboard/OpdrachtgeverDashboardLayout";

// Mock data - will be replaced with real API calls
const mockData = {
  company: {
    name: "Schiphol Security B.V.",
    rating: 4.7,
    totalShifts: 2847,
    memberSince: "Maart 2019"
  },
  financial: {
    outstandingAmount: 4892.50,
    budgetUsed: 72,
    monthlyBudget: 25000
  },
  locations: {
    active: 12,
    mostUsed: "Terminal 1"
  },
  team: {
    members: 8
  }
};

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
  badge?: React.ReactNode;
  warning?: boolean;
}

function MenuItem({ icon, title, subtitle, onClick, badge, warning = false }: MenuItemProps) {
  return (
    <Card
      className={`p-4 mx-4 mb-2 cursor-pointer hover:bg-gray-50 transition-colors ${
        warning ? 'border-amber-200 bg-amber-50/50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${warning ? 'bg-amber-100' : 'bg-blue-100'}`}>
            <div className={warning ? 'text-amber-600' : 'text-blue-600'}>
              {icon}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-base">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-xs font-bold uppercase text-muted-foreground mx-4 mt-6 mb-2">
      {title}
    </h2>
  );
}

export default function OpdrachtgeverMeerPage() {
  const [showReport, setShowReport] = useState(false);

  return (
    <OpdrachtgeverDashboardLayout
      title="Meer"
      subtitle={`${mockData.company.name}`}
    >
      <div className="pb-6">
        {/* Company Quick Info */}
        <Card className="m-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{mockData.company.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>{mockData.company.rating}</span>
                </div>
                <span>•</span>
                <span>{mockData.company.totalShifts.toLocaleString()} shifts</span>
                <span>•</span>
                <span>Sinds {mockData.company.memberSince}</span>
              </div>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              Premium Business
            </Badge>
          </div>
        </Card>

        {/* Reports & Analysis */}
        <SectionHeader title="RAPPORTEN & ANALYSE" />

        <MenuItem
          icon={<BarChart3 className="h-5 w-5" />}
          title="Shift rapportages"
          subtitle="Uren, kosten, performance"
          onClick={() => setShowReport(true)}
        />

        <MenuItem
          icon={<TrendingUp className="h-5 w-5" />}
          title="Analytics dashboard"
          subtitle="KPI's en trends"
        />

        {/* Financial */}
        <SectionHeader title="FINANCIEEL" />

        <MenuItem
          icon={<CreditCard className="h-5 w-5" />}
          title="Facturen & betalingen"
          subtitle={`Openstaand: €${mockData.financial.outstandingAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
          warning={mockData.financial.outstandingAmount > 0}
          badge={
            mockData.financial.outstandingAmount > 0 ? (
              <Badge variant="destructive" className="text-xs">
                3 openstaand
              </Badge>
            ) : undefined
          }
        />

        <MenuItem
          icon={<PiggyBank className="h-5 w-5" />}
          title="Budget beheer"
          subtitle={`Deze maand: ${mockData.financial.budgetUsed}% gebruikt`}
          badge={
            mockData.financial.budgetUsed > 80 ? (
              <Badge className="bg-amber-100 text-amber-800 text-xs">
                {mockData.financial.budgetUsed}%
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                {mockData.financial.budgetUsed}%
              </Badge>
            )
          }
        />

        {/* Company */}
        <SectionHeader title="BEDRIJF" />

        <MenuItem
          icon={<Building className="h-5 w-5" />}
          title="Bedrijfsprofiel"
          subtitle={mockData.company.name}
        />

        <MenuItem
          icon={<MapPin className="h-5 w-5" />}
          title="Locaties beheren"
          subtitle={`${mockData.locations.active} actieve locaties`}
        />

        <MenuItem
          icon={<Users className="h-5 w-5" />}
          title="Gebruikers & rollen"
          subtitle={`${mockData.team.members} teamleden`}
        />

        {/* Compliance & Documents */}
        <SectionHeader title="COMPLIANCE & DOCUMENTEN" />

        <MenuItem
          icon={<FileText className="h-5 w-5" />}
          title="Protocollen & procedures"
          subtitle="Bedrijfsrichtlijnen"
        />

        <MenuItem
          icon={<CheckCircle className="h-5 w-5" />}
          title="Compliance center"
          subtitle="VOG/VCA tracking"
          badge={
            <Badge className="bg-green-100 text-green-800 text-xs">
              94% compliant
            </Badge>
          }
        />

        {/* Support */}
        <SectionHeader title="SUPPORT" />

        <MenuItem
          icon={<MessageCircle className="h-5 w-5" />}
          title="Help & Support"
          subtitle="Contact opnemen"
        />

        <MenuItem
          icon={<Book className="h-5 w-5" />}
          title="Handleiding"
          subtitle="Gebruikersgids"
        />

        {/* Account Management */}
        <SectionHeader title="ACCOUNT" />

        <Card className="mx-4 mb-2 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Account type</h3>
                <p className="text-sm text-muted-foreground">Premium Business</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                Premium
              </Badge>
            </div>

            <div className="border-t pt-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Verificatie:</span>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs">KvK gecontroleerd</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs">BTW geregistreerd</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs">Bank geverifieerd</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Platform stats:</span>
                  <div className="mt-1 space-y-1 text-xs">
                    <div>Lid sinds: {mockData.company.memberSince}</div>
                    <div>Rating: ⭐ {mockData.company.rating}</div>
                    <div>Reviews: 247</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <SectionHeader title="QUICK ACTIONS" />

        <div className="mx-4 grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12">
            <Download className="h-4 w-4 mr-2" />
            Export data
          </Button>
          <Button variant="outline" className="h-12">
            <Calendar className="h-4 w-4 mr-2" />
            Planning
          </Button>
        </div>

        {/* Report Modal */}
        {showReport && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Shift Rapportages</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReport(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Period Selector */}
                <div>
                  <Button variant="outline" className="w-full justify-between">
                    Periode: September 2024
                    <ChevronRight className="h-4 w-4 rotate-90" />
                  </Button>
                </div>

                {/* Overview */}
                <div>
                  <h4 className="font-semibold mb-3">OVERZICHT</h4>
                  <Card className="p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Totaal shifts:</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Voltooid:</span>
                      <span className="font-medium text-green-600">45 (96%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Geannuleerd:</span>
                      <span className="font-medium text-amber-600">2 (4%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>No-shows:</span>
                      <span className="font-medium">0 (0%)</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between">
                      <span>Totale uren:</span>
                      <span className="font-medium">376 uur</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Totale kosten:</span>
                      <span className="font-medium text-green-600">€15.892</span>
                    </div>
                  </Card>
                </div>

                {/* Performance */}
                <div>
                  <h4 className="font-semibold mb-3">PERFORMANCE</h4>
                  <Card className="p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>⏰ On-time rate:</span>
                      <span className="font-medium text-green-600">98%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>⭐ Gem. rating:</span>
                      <span className="font-medium">4.7/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🔄 Repeat bookings:</span>
                      <span className="font-medium text-blue-600">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>⚠️ Issues gemeld:</span>
                      <span className="font-medium text-amber-600">3</span>
                    </div>
                  </Card>
                </div>

                {/* Top Performers */}
                <div>
                  <h4 className="font-semibold mb-3">TOP BEVEILIGERS</h4>
                  <Card className="p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>1. Jan de Vries</span>
                      <span className="flex items-center gap-1">
                        12 shifts <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> 4.9
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>2. Maria Jansen</span>
                      <span className="flex items-center gap-1">
                        8 shifts <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> 4.8
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>3. Ahmed Khan</span>
                      <span className="flex items-center gap-1">
                        7 shifts <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> 4.7
                      </span>
                    </div>
                  </Card>
                </div>

                {/* Export Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Excel
                  </Button>
                  <Button variant="outline" className="flex-1" size="sm">
                    📊 Gedetaileerd
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </OpdrachtgeverDashboardLayout>
  );
}