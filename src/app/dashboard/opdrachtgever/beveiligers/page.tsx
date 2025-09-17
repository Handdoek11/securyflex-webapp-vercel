"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MapPin,
  Users,
  Euro,
  Star,
  Heart,
  MessageCircle,
  User,
  Award,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpdrachtgeverDashboardLayout } from "@/components/dashboard/OpdrachtgeverDashboardLayout";
import { useOpdrachtgeverBeveiligers, useOpdrachtgeverFavorites, useManageFavorites } from "@/hooks/useApiData";
import { toast } from "@/components/ui/toast";

// Note: Beveiligers page has minimal real-time requirements
// Most updates are user-initiated (favorites, filtering)
// Real-time updates would mainly come from beveiliger availability changes

function getStatusIndicator(status: string, isOnline?: boolean) {
  if (isOnline) {
    return <div className="flex items-center gap-1">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-green-600 text-sm font-medium">🟢</span>
    </div>;
  }

  switch (status) {
    case "AVAILABLE":
      return <span className="text-green-600">🟢</span>;
    case "LIMITED":
      return <span className="text-amber-600">🟡</span>;
    case "UNAVAILABLE":
      return <span className="text-red-600">🔴</span>;
    default:
      return <span className="text-gray-500">⚫</span>;
  }
}

function BeveiligersCard({ beveiliger, onToggleFavorite, isUpdating }: {
  beveiliger: any;
  onToggleFavorite: (id: string) => void;
  isUpdating?: boolean;
}) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start gap-3">
        {/* Profile Photo */}
        <div className="relative">
          <div className="w-15 h-15 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
            {beveiliger.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          {beveiliger.isPremium && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <Award className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-2">
          {/* Name & Rating */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{beveiliger.name}</h3>
              <p className="text-sm text-muted-foreground">{beveiliger.specialization}</p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium text-sm">{beveiliger.rating}</span>
            </div>
          </div>

          {/* Status & Availability */}
          <div className="flex items-center gap-2 text-sm">
            {getStatusIndicator(beveiliger.status, beveiliger.isOnline)}
            <span className={
              beveiliger.status === "AVAILABLE" ? "text-green-700" :
              beveiliger.status === "LIMITED" ? "text-amber-700" :
              "text-red-700"
            }>
              {beveiliger.availabilityText}
            </span>
            {beveiliger.isFavoriteClient && (
              <Badge variant="secondary" className="text-xs">
                <Heart className="h-3 w-3 mr-1 fill-red-500 text-red-500" />
                Favoriete klant
              </Badge>
            )}
          </div>

          {/* Location & Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{beveiliger.location} ({beveiliger.distance}km)</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{beveiliger.shiftsCompleted} shifts</span>
            </div>
            {beveiliger.hourlyRate && (
              <div className="flex items-center gap-1 text-green-600 font-medium">
                <Euro className="h-3 w-3" />
                <span>€{beveiliger.hourlyRate.toFixed(2)}/uur</span>
              </div>
            )}
          </div>

          {/* Special Indicators */}
          {beveiliger.isPremium && (
            <div className="flex items-center gap-1 text-sm">
              <Award className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-700 font-medium">Premium beveiliger</span>
            </div>
          )}

          {beveiliger.isNewTalent && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-blue-700">🎓 Nieuw talent</span>
            </div>
          )}

          {beveiliger.recentWork && (
            <p className="text-sm text-muted-foreground">
              Recent: {beveiliger.recentWork}
            </p>
          )}

          {beveiliger.reliability && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{beveiliger.reliability}% betrouwbaar</span>
            </div>
          )}

          {beveiliger.nextAvailable && (
            <p className="text-sm text-muted-foreground">
              {beveiliger.nextAvailable}
            </p>
          )}

          {beveiliger.recentAchievement && (
            <p className="text-sm text-blue-600">
              🎓 {beveiliger.recentAchievement}
            </p>
          )}

          {/* Certifications */}
          {beveiliger.certifications && beveiliger.certifications.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {beveiliger.specialization === "Starter (3 maanden)" ? "Certificaten:" :
                 beveiliger.specialization === "Mobiele Surveillance" ? "Specialisaties:" :
                 "Certificaten:"}
              </p>
              <div className="flex flex-wrap gap-1">
                {beveiliger.certifications.map((cert: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Document Status Warning */}
          {beveiliger.documents?.vog === false && (
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              <span>📄 VOG verloopt over {beveiliger.documents.vogExpiresInDays} dagen</span>
            </div>
          )}

          {/* Documents Status (only for favorites) */}
          {beveiliger.documents && beveiliger.isFavorite && (
            <div className="text-sm">
              <p className="font-medium mb-1">📄 Documenten:</p>
              <div className="space-x-2">
                <span>Pas {beveiliger.documents.id ? '✅' : '❌'}</span>
                <span>VOG {beveiliger.documents.vog ? '✅' : '❌'}</span>
                <span>Diploma {beveiliger.documents.diploma ? '✅' : '❌'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t">
        <Button className="flex-1" size="sm" disabled={beveiliger.status === "UNAVAILABLE"}>
          {beveiliger.status === "UNAVAILABLE" ? "Boek voor morgen" :
           beveiliger.isNewTalent ? "Probeer uit" :
           "Direct boeken"}
        </Button>
        <Button variant="outline" size="sm">
          <MessageCircle className="h-3 w-3 mr-1" />
          Bericht
        </Button>
        <Button variant="outline" size="sm">
          <User className="h-3 w-3 mr-1" />
          Profiel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleFavorite(beveiliger.id)}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Heart className={`h-3 w-3 ${beveiliger.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          )}
        </Button>
        {beveiliger.isNewTalent && (
          <Button variant="outline" size="sm" className="ml-1">
            Training schema
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function OpdrachtgeverBeveiligersPage() {
  const [activeTab, setActiveTab] = useState("favorieten");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    view: "all" as "all" | "favorites" | "available",
    location: "",
    specialization: "",
    minRating: 0,
    availableOnly: false
  });

  // API hooks
  const { data: beveiligersData, loading: beveiligersLoading, refetch: refetchBeveiligers } = useOpdrachtgeverBeveiligers({
    view: filters.view,
    search: searchQuery,
    location: filters.location,
    specialization: filters.specialization,
    minRating: filters.minRating,
    availableOnly: filters.availableOnly
  });

  const { data: favoritesData, loading: favoritesLoading, refetch: refetchFavorites } = useOpdrachtgeverFavorites();
  const { mutate: manageFavorite, loading: managingFavorite } = useManageFavorites();

  // Extract data
  const beveiligers = beveiligersData?.beveiligers || [];
  const stats = beveiligersData?.stats || { total: 0, available: 0, favorites: 0, premium: 0, averageRating: 0 };
  const favorites = favoritesData?.favorites || [];

  // Update filters based on active tab
  useEffect(() => {
    const newFilters = { ...filters };

    switch (activeTab) {
      case "favorieten":
        newFilters.view = "favorites";
        break;
      case "beschikbaar":
        newFilters.view = "available";
        break;
      case "alle":
        newFilters.view = "all";
        break;
    }

    setFilters(newFilters);
  }, [activeTab]);

  const toggleFavorite = async (beveiligerId: string) => {
    try {
      const isCurrentlyFavorite = beveiligers.find(b => b.id === beveiligerId)?.isFavorite ||
                                 favorites.some(f => f.id === beveiligerId);

      const result = await manageFavorite({
        beveiligerId,
        action: isCurrentlyFavorite ? "remove" : "add"
      });

      if (result.success) {
        toast.success(result.message);
        // Refetch data to update the UI
        refetchBeveiligers();
        refetchFavorites();
      } else {
        toast.error(result.error || "Er ging iets mis");
      }
    } catch (error) {
      toast.error("Er ging iets mis bij het bijwerken van favorieten");
    }
  };

  const favoritenCount = stats.favorites;
  const beschikbaarCount = stats.available;
  const alleCount = stats.total;

  return (
    <OpdrachtgeverDashboardLayout
      title="Beveiligers"
      subtitle="Beheer je beveiligingsteam"
    >
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="favorieten" className="text-sm">
              Favorieten
              <Badge variant="secondary" className="ml-2 text-xs">
                {favoritenCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="beschikbaar" className="text-sm">
              Beschikbaar
              <Badge variant="secondary" className="ml-2 text-xs">
                {beschikbaarCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="alle" className="text-sm">
              Alle
              <Badge variant="secondary" className="ml-2 text-xs">
                {alleCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Search & Filter Bar */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek beveiliger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <Card className="p-3 bg-gray-50">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">FILTERS</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Locatie: Amsterdam ▼
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Afstand: 10km ▼
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Skills: VCA ▼
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    + Meer
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Rating: 4+ sterren ▼
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Favorieten Tab */}
          <TabsContent value="favorieten" className="space-y-4">
            {favoritesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-15 w-15 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : favorites.length > 0 ? (
              <>
                <h3 className="font-semibold text-lg">FAVORIETE BEVEILIGERS</h3>
                {favorites.map((beveiliger) => (
                  <BeveiligersCard
                    key={beveiliger.id}
                    beveiliger={{
                      ...beveiliger,
                      isFavorite: true,
                      availabilityText: beveiliger.isAvailable ? "Beschikbaar nu" : "Niet beschikbaar",
                      status: beveiliger.isAvailable ? "AVAILABLE" : "UNAVAILABLE"
                    }}
                    onToggleFavorite={toggleFavorite}
                    isUpdating={managingFavorite}
                  />
                ))}
              </>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="text-4xl">⭐</div>
                <h3 className="text-lg font-semibold">Nog geen favoriete beveiligers</h3>
                <p className="text-muted-foreground">
                  Voeg beveiligers toe aan je favorieten voor snelle toegang.
                </p>
                <Button onClick={() => setActiveTab("alle")}>
                  Ontdek beveiligers
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Beschikbaar Tab */}
          <TabsContent value="beschikbaar" className="space-y-4">
            {beveiligersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-15 w-15 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-lg">NU BESCHIKBAAR</h3>
                {beveiligers
                  .filter(b => b.isAvailable)
                  .length > 0 ? (
                  beveiligers
                    .filter(b => b.isAvailable)
                    .map((beveiliger) => (
                    <BeveiligersCard
                      key={beveiliger.id}
                      beveiliger={{
                        ...beveiliger,
                        availabilityText: "Beschikbaar nu",
                        status: "AVAILABLE",
                        isFavorite: favorites.some(f => f.id === beveiliger.id)
                      }}
                      onToggleFavorite={toggleFavorite}
                      isUpdating={managingFavorite}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <div className="text-2xl">🔍</div>
                    <p className="text-muted-foreground">Geen beschikbare beveiligers gevonden</p>
                  </div>
                )}

                <h3 className="font-semibold text-lg mt-6">BEPERKT BESCHIKBAAR</h3>
                {beveiligers
                  .filter(b => !b.isAvailable)
                  .length > 0 ? (
                  beveiligers
                    .filter(b => !b.isAvailable)
                    .map((beveiliger) => (
                    <BeveiligersCard
                      key={beveiliger.id}
                      beveiliger={{
                        ...beveiliger,
                        availabilityText: "Beperkt beschikbaar",
                        status: "LIMITED",
                        isFavorite: favorites.some(f => f.id === beveiliger.id)
                      }}
                      onToggleFavorite={toggleFavorite}
                      isUpdating={managingFavorite}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <div className="text-2xl">✅</div>
                    <p className="text-muted-foreground">Alle beveiligers zijn beschikbaar!</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Alle Tab */}
          <TabsContent value="alle" className="space-y-4">
            {beveiligersLoading ? (
              <div className="space-y-4">
                <Card className="p-4">
                  <Skeleton className="h-6 w-[200px] mb-3" />
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                </Card>
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-15 w-15 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* Team Statistics */}
                <Card className="p-4">
                  <h3 className="font-semibold text-lg mb-3">TEAM STATISTIEKEN</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Totaal beveiligers:</span>
                      <span className="ml-2 font-medium">{stats.total}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Beschikbaar nu:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {stats.available} ({stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gemiddelde rating:</span>
                      <span className="ml-2 font-medium flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        {stats.averageRating || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Premium beveiligers:</span>
                      <span className="ml-2 font-medium">{stats.premium}</span>
                    </div>
                  </div>
                </Card>

                <h3 className="font-semibold text-lg">ALLE BEVEILIGERS</h3>

                {beveiligers.length > 0 ? (
                  beveiligers.map((beveiliger) => (
                    <BeveiligersCard
                      key={beveiliger.id}
                      beveiliger={{
                        ...beveiliger,
                        availabilityText: beveiliger.isAvailable ? "Beschikbaar nu" : "Beperkt beschikbaar",
                        status: beveiliger.isAvailable ? "AVAILABLE" : "LIMITED",
                        isFavorite: favorites.some(f => f.id === beveiliger.id)
                      }}
                      onToggleFavorite={toggleFavorite}
                      isUpdating={managingFavorite}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="text-4xl">👥</div>
                    <h3 className="text-lg font-semibold">Geen beveiligers gevonden</h3>
                    <p className="text-muted-foreground">
                      Er zijn momenteel geen beveiligers beschikbaar die voldoen aan je zoekcriteria.
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Floating Action Button */}
        <div className="fixed bottom-24 right-4 z-40">
          <Button
            className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </OpdrachtgeverDashboardLayout>
  );
}