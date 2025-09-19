"use client";

import {
  BarChart3,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Maximize,
  Monitor,
  Shield,
  Smartphone,
  Tablet,
  TrendingUp,
  Users,
} from "lucide-react";
import { OpdrachtgeverDashboardLayout } from "@/components/dashboard/OpdrachtgeverDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResponsive } from "@/hooks/useResponsive";
import { useViewportSize } from "@/hooks/useViewportSize";

export default function OpdrachtgeverResponsiveDemoPage() {
  const responsive = useResponsive();
  const viewport = useViewportSize();

  const getDeviceIcon = () => {
    switch (responsive.deviceType) {
      case "mobile":
        return <Smartphone className="h-8 w-8" />;
      case "tablet":
        return <Tablet className="h-8 w-8" />;
      case "desktop":
        return <Monitor className="h-8 w-8" />;
      case "largeDesktop":
        return <Maximize className="h-8 w-8" />;
    }
  };

  // Mock stats voor demonstratie
  const stats = [
    {
      title: "Actieve Opdrachten",
      value: "12",
      change: "+3 deze week",
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Beveiligers Ingezet",
      value: "48",
      change: "96% aanwezig",
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Totale Kosten",
      value: "€18,450",
      change: "-8% t.o.v. vorige maand",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Gemiddelde Score",
      value: "4.8",
      change: "Top 10% leveranciers",
      icon: BarChart3,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <OpdrachtgeverDashboardLayout
      title="Responsive Systeem Demo"
      subtitle="Test het nieuwe responsive navigatie systeem voor opdrachtgevers"
    >
      <div className="space-y-6">
        {/* Current Device Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getDeviceIcon()}
              <span>Huidige Weergave</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Device Type
                </p>
                <Badge variant="default" className="text-lg px-3 py-1">
                  {responsive.deviceType}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Viewport</p>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {viewport.width} x {viewport.height}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Navigatie Type
                </p>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {responsive.isMobileOrTablet && !responsive.isTabletOrDesktop
                    ? "Bottom Nav"
                    : "Sidebar"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Touch Device
                </p>
                <Badge
                  variant={responsive.isTouch ? "default" : "secondary"}
                  className="text-lg px-3 py-1"
                >
                  {responsive.isTouch ? "Ja" : "Nee"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Grid Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bg}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    {index === 0 && (
                      <Badge variant="destructive" className="animate-pulse">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-green-600 mt-2">{stat.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Navigation Features */}
        <Card>
          <CardHeader>
            <CardTitle>Navigatie Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mobile Features */}
              <div
                className={`p-4 rounded-lg border ${!responsive.isTabletOrDesktop ? "border-primary bg-primary/5" : ""}`}
              >
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Mobile View ({"<"} 768px)
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Bottom navigation met 6 hoofditems
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Fixed header met bedrijfsnaam
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Swipe gestures support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Compacte kaarten en lijsten
                  </li>
                </ul>
              </div>

              {/* Tablet Features */}
              <div
                className={`p-4 rounded-lg border ${responsive.isTablet ? "border-primary bg-primary/5" : ""}`}
              >
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Tablet className="h-5 w-5" />
                  Tablet View (768px - 1024px)
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Collapsed sidebar met iconen
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Hover tooltips voor navigatie
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    2-kolom grid layouts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Actieve opdrachten badge zichtbaar
                  </li>
                </ul>
              </div>

              {/* Desktop Features */}
              <div
                className={`p-4 rounded-lg border ${responsive.isDesktop || responsive.isLargeDesktop ? "border-primary bg-primary/5" : ""}`}
              >
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Desktop View ({">"}= 1024px)
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Volledige sidebar met labels
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Live notificaties en alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Multi-kolom dashboards
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Uitgebreide tabellen en grafieken
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Responsive Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Snelle Acties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Nieuwe Opdracht</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <Users className="h-5 w-5" />
                <span className="text-xs">Zoek Beveiliger</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-xs">Facturen</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Analytics</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <Bell className="h-5 w-5" />
                <span className="text-xs">Meldingen</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-xs">Veiligheid</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-xs">Planning</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4 gap-2">
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs">Rapporten</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">1</Badge>
                <p className="text-sm">
                  <strong>Mobile Test:</strong> Resize je browser naar {"<"}
                  768px om de bottom navigation te zien met alle opdrachtgever
                  functies.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">2</Badge>
                <p className="text-sm">
                  <strong>Tablet Test:</strong> Test tussen 768px-1024px voor de
                  collapsed sidebar met tooltips.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">3</Badge>
                <p className="text-sm">
                  <strong>Desktop Test:</strong> Maximaliseer je browser ({">"}
                  1024px) voor de volledige sidebar ervaring.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="mt-0.5">4</Badge>
                <p className="text-sm">
                  <strong>Live Test:</strong> Navigeer naar{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    /dashboard/opdrachtgever
                  </code>{" "}
                  om het systeem in actie te zien.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OpdrachtgeverDashboardLayout>
  );
}
