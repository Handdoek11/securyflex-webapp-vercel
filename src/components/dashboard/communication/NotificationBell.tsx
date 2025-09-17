"use client";

import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  BellRing,
  Shield,
  Euro,
  MessageSquare,
  Star,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Settings,
  Trash2,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { createSupabaseClient } from "@/lib/supabase/client";

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
  metadata?: any;
  createdAt: Date;
}

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
    setupRealtimeSubscription();

    return () => {
      supabase.removeAllChannels();
    };
  }, [isOpen]);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") {
        params.append("category", selectedCategory);
      }

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notifications);
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

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications?unreadOnly=true&limit=0");
      const data = await response.json();

      if (data.success) {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    supabase
      .channel(`user:${userId}:notifications`)
      .on("broadcast", { event: "new_notification" }, ({ payload }) => {
        setNotifications(prev => [payload, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show browser notification if permission granted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(payload.title, {
            body: payload.message,
            icon: "/logo-website-securyflex.svg"
          });
        }
      })
      .subscribe();
  };

  const markAsRead = async (notificationIds?: string[]) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationIds,
          markAllAsRead: !notificationIds
        })
      });

      const data = await response.json();

      if (data.success) {
        if (notificationIds) {
          setNotifications(prev =>
            prev.map(notif =>
              notificationIds.includes(notif.id)
                ? { ...notif, isRead: true, readAt: new Date() }
                : notif
            )
          );
          setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
        } else {
          setNotifications(prev =>
            prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
          );
          setUnreadCount(0);
        }
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
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        if (notificationIds) {
          setNotifications(prev =>
            prev.filter(notif => !notificationIds.includes(notif.id))
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

    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "OPDRACHT_NEW":
      case "OPDRACHT_ASSIGNED":
      case "OPDRACHT_UPDATED":
        return <Briefcase className="h-4 w-4" />;
      case "OPDRACHT_CANCELLED":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "TEAM_INVITED":
      case "TEAM_ACCEPTED":
        return <Users className="h-4 w-4" />;
      case "MESSAGE_NEW":
        return <MessageSquare className="h-4 w-4" />;
      case "REVIEW_RECEIVED":
        return <Star className="h-4 w-4 text-yellow-500" />;
      case "PAYMENT_RECEIVED":
        return <Euro className="h-4 w-4 text-green-500" />;
      case "PAYMENT_PENDING":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "WERKUUR_APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "WERKUUR_DISPUTED":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "SYSTEM_ANNOUNCEMENT":
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
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

  const filteredNotifications = selectedCategory === "ALL"
    ? notifications
    : notifications.filter(n => n.category === selectedCategory);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <>
              <BellRing className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Notificaties</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markAsRead()}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Markeer alle als gelezen
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteNotifications()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ALL">
                Alle
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="OPDRACHT">
                <Briefcase className="h-3 w-3" />
                {categoryCounts.OPDRACHT > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1">
                    {categoryCounts.OPDRACHT}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="MESSAGE">
                <MessageSquare className="h-3 w-3" />
                {categoryCounts.MESSAGE > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1">
                    {categoryCounts.MESSAGE}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="PAYMENT">
                <Euro className="h-3 w-3" />
                {categoryCounts.PAYMENT > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1">
                    {categoryCounts.PAYMENT}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Geen notificaties</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => handleActionClick(notification)}
                  className={cn(
                    "w-full p-4 hover:bg-muted/50 transition-colors text-left",
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={cn(
                            "text-sm",
                            !notification.isRead && "font-semibold"
                          )}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString("nl-NL", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                        {notification.actionUrl && (
                          <Badge variant="outline" className="text-xs">
                            {notification.actionLabel || "Bekijk"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t bg-muted/50">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm"
            onClick={() => {
              window.location.href = "/dashboard/notifications";
              setIsOpen(false);
            }}
          >
            Bekijk alle notificaties
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}