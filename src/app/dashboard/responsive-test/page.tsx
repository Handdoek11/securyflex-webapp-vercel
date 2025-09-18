"use client";

import { Maximize, Monitor, Smartphone, Tablet } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useResponsive } from "@/hooks/useResponsive";
import { useViewportSize } from "@/hooks/useViewportSize";

export default function ResponsiveTestPage() {
  const responsive = useResponsive();
  const viewport = useViewportSize();

  // Test different breakpoints
  const isXs = useMediaQuery("(min-width: 475px)");
  const isSm = useMediaQuery("(min-width: 640px)");
  const isMd = useMediaQuery("(min-width: 768px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isXl = useMediaQuery("(min-width: 1280px)");
  const is2xl = useMediaQuery("(min-width: 1536px)");

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

  return (
    <DashboardLayout
      title="Responsive System Test"
      subtitle="Test het nieuwe responsive navigatie systeem"
    >
      <div className="space-y-6">
        {/* Current Device Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getDeviceIcon()}
              <span>Huidige Device Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Device Type
                </p>
                <Badge variant="default" className="text-lg px-3 py-1">
                  {responsive.deviceType}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Viewport Size
                </p>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {viewport.width} x {viewport.height}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Orientation
                </p>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {viewport.isPortrait ? "Portrait" : "Landscape"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Touch Device
                </p>
                <Badge
                  variant={responsive.isTouch ? "success" : "secondary"}
                  className="text-lg px-3 py-1"
                >
                  {responsive.isTouch ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakpoint Status */}
        <Card>
          <CardHeader>
            <CardTitle>Breakpoint Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="text-center">
                <Badge
                  variant={isXs ? "default" : "outline"}
                  className="w-full justify-center py-2"
                >
                  XS (475px+)
                </Badge>
              </div>
              <div className="text-center">
                <Badge
                  variant={isSm ? "default" : "outline"}
                  className="w-full justify-center py-2"
                >
                  SM (640px+)
                </Badge>
              </div>
              <div className="text-center">
                <Badge
                  variant={isMd ? "default" : "outline"}
                  className="w-full justify-center py-2"
                >
                  MD (768px+)
                </Badge>
              </div>
              <div className="text-center">
                <Badge
                  variant={isLg ? "default" : "outline"}
                  className="w-full justify-center py-2"
                >
                  LG (1024px+)
                </Badge>
              </div>
              <div className="text-center">
                <Badge
                  variant={isXl ? "default" : "outline"}
                  className="w-full justify-center py-2"
                >
                  XL (1280px+)
                </Badge>
              </div>
              <div className="text-center">
                <Badge
                  variant={is2xl ? "default" : "outline"}
                  className="w-full justify-center py-2"
                >
                  2XL (1536px+)
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Info */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Current Navigation:</h3>
                {responsive.isMobileOrTablet &&
                !responsive.isTabletOrDesktop ? (
                  <div>
                    <Badge variant="default" className="mb-2">
                      Bottom Navigation
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Je ziet nu de bottom navigation bar onderaan het scherm.
                      Deze is geoptimaliseerd voor mobiele apparaten met touch
                      interface.
                    </p>
                  </div>
                ) : (
                  <div>
                    <Badge variant="default" className="mb-2">
                      Sidebar Navigation
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Je ziet nu de sidebar navigatie aan de linkerkant.
                      {responsive.isTablet
                        ? "Op tablet wordt deze automatisch ingeklapt met alleen iconen."
                        : "Op desktop toont deze de volledige navigatie met labels."}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-3 rounded-lg border ${responsive.isMobileOnly ? "border-primary bg-primary/5" : ""}`}
                >
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Mobile ({"<"} 768px)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Bottom navigation met fixed position
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg border ${responsive.isTabletOnly ? "border-primary bg-primary/5" : ""}`}
                >
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <Tablet className="h-4 w-4" />
                    Tablet (768px - 1024px)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Collapsed sidebar met icons only
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg border ${responsive.isDesktopOnly ? "border-primary bg-primary/5" : ""}`}
                >
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Desktop (1024px - 1536px)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Full sidebar met labels en badges
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg border ${responsive.isLargeDesktop ? "border-primary bg-primary/5" : ""}`}
                >
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <Maximize className="h-4 w-4" />
                    Large Desktop ({">"}= 1536px)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Full sidebar met extra content ruimte
                  </p>
                </div>
              </div>
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
              <p className="text-sm">
                🔍 <strong>Browser Developer Tools:</strong> Open de developer
                tools (F12) en gebruik de device toolbar om verschillende
                schermgroottes te testen.
              </p>
              <p className="text-sm">
                📱 <strong>Mobile Test:</strong> Maak je browser window smaller
                dan 768px om de bottom navigation te zien.
              </p>
              <p className="text-sm">
                📱 <strong>Tablet Test:</strong> Resize naar 768px - 1024px om
                de collapsed sidebar te zien.
              </p>
              <p className="text-sm">
                💻 <strong>Desktop Test:</strong> Maak je browser window breder
                dan 1024px voor de volledige sidebar.
              </p>
              <p className="text-sm">
                🖥️ <strong>Large Desktop:</strong> Op schermen breder dan 1536px
                krijg je extra content ruimte.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
