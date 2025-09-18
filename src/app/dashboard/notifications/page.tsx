"use client";

import {
  AlertCircle,
  Bell,
  Briefcase,
  Check,
  CheckCircle,
  Clock,
  Euro,
  MessageSquare,
  Search,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRead, setFilterRead] = useState("ALL");
  const [unreadCount, setUnreadCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session, fetchNotifications]);

  useEffect(() => {
    // Apply filters
    let filtered = notifications;

    // Category filter
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((n) => n.category === selectedCategory);
    }

    // Read status filter
    if (filterRead === "UNREAD") {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (filterRead === "READ") {
      filtered = filtered.filter((n) => n.isRead);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, selectedCategory, filterRead, searchQuery]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications?limit=50");
      const data = await response.json();

      if (data.success) {
        const notifs = data.data.notifications.map(
          (
            n: Omit<Notification, "createdAt" | "readAt"> & {
              createdAt: string;
              readAt?: string;
            },
          ) => ({
            ...n,
            createdAt: new Date(n.createdAt),
            readAt: n.readAt ? new Date(n.readAt) : undefined,
          }),
        );

        setNotifications(notifs);
        setUnreadCount(data.data.unreadCount);
        setCategoryCounts(data.data.categoryCounts);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Kon notificaties niet laden");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds?: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationIds,
          markAllAsRead: !notificationIds,
        }),
      });

      if (response.ok) {
        if (notificationIds) {
          setNotifications((prev) =>
            prev.map((notif) =>
              notificationIds.includes(notif.id)
                ? { ...notif, isRead: true, readAt: new Date() }
                : notif,
            ),
          );
          setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
        } else {
          setNotifications((prev) =>
            prev.map((notif) => ({
              ...notif,
              isRead: true,
              readAt: new Date(),
            })),
          );
          setUnreadCount(0);
        }
        toast.success("Notificaties gemarkeerd als gelezen");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Kon notificaties niet markeren als gelezen");
    }
  };

  const deleteNotifications = async (notificationIds?: string[]) => {
    try {
      const params = new URLSearchParams();
      if (notificationIds) {
        params.append("ids", notificationIds.join(","));
      } else {
        params.append("clearAll", "true");
      }

      const response = await fetch(`/api/notifications?${params}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (notificationIds) {
          setNotifications((prev) =>
            prev.filter((notif) => !notificationIds.includes(notif.id)),
          );
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
        toast.success("Notificaties verwijderd");
      }
    } catch (error) {
      console.error("Error deleting notifications:", error);
      toast.error("Kon notificaties niet verwijderen");
    }
  };

  const handleActionClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead([notification.id]);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "OPDRACHT_NEW":
      case "OPDRACHT_ASSIGNED":
      case "OPDRACHT_UPDATED":
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      case "OPDRACHT_CANCELLED":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "TEAM_INVITED":
      case "TEAM_ACCEPTED":
        return <Users className="h-5 w-5 text-purple-500" />;
      case "MESSAGE_NEW":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "REVIEW_RECEIVED":
        return <Star className="h-5 w-5 text-yellow-500" />;
      case "PAYMENT_RECEIVED":
        return <Euro className="h-5 w-5 text-green-500" />;
      case "PAYMENT_PENDING":
        return <Clock className="h-5 w-5 text-orange-500" />;
      case "WERKUUR_APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "WERKUUR_DISPUTED":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "SYSTEM_ANNOUNCEMENT":
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "OPDRACHT":
        return "Opdrachten";
      case "TEAM":
        return "Team";
      case "PAYMENT":
        return "Betalingen";
      case "MESSAGE":
        return "Berichten";
      case "REVIEW":
        return "Beoordelingen";
      case "SYSTEM":
        return "Systeem";
      default:
        return "Alle";
    }
  };

  return (
    <DashboardLayout
      title="Notificaties"
      subtitle={`${unreadCount} ongelezen van ${notifications.length} totaal`}
      headerActions={
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={() => markAsRead()}>
              <Check className="h-4 w-4 mr-2" />
              Markeer alle als gelezen
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteNotifications()}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Wis alle
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek in notificaties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  Alle categorieën
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </SelectItem>
                {Object.entries(categoryCounts).map(([category, count]) => (
                  <SelectItem key={category} value={category}>
                    {getCategoryLabel(category)}
                    {count > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {count}
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Read Status Filter */}
            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Alle</SelectItem>
                <SelectItem value="UNREAD">Ongelezen</SelectItem>
                <SelectItem value="READ">Gelezen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Notifications List */}
        <Card>
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Geen notificaties</h3>
              <p>
                {searchQuery
                  ? "Geen notificaties gevonden voor deze zoekopdracht"
                  : selectedCategory !== "ALL"
                    ? "Geen notificaties in deze categorie"
                    : "Je hebt nog geen notificaties ontvangen"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification, _index) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                    !notification.isRead && "bg-primary/5",
                  )}
                  onClick={() => handleActionClick(notification)}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4
                            className={cn(
                              "text-sm font-medium leading-5",
                              !notification.isRead && "font-semibold",
                            )}
                          >
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1 leading-5">
                            {notification.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                          {notification.actionUrl && (
                            <Badge variant="outline" className="text-xs">
                              {notification.actionLabel || "Bekijk"}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          {notification.createdAt.toLocaleString("nl-NL", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryLabel(notification.category)}
                          </Badge>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotifications([notification.id]);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Load More Button */}
        {filteredNotifications.length > 0 &&
          filteredNotifications.length >= 50 && (
            <div className="text-center">
              <Button variant="outline" onClick={fetchNotifications}>
                Laad meer notificaties
              </Button>
            </div>
          )}
      </div>
    </DashboardLayout>
  );
}
