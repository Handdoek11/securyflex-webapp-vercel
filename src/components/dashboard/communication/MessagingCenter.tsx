"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Send,
  Search,
  Plus,
  Users,
  User,
  Briefcase,
  Shield,
  Paperclip,
  MapPin,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Edit2,
  Trash2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { createSupabaseClient } from "@/lib/supabase/client";

interface Conversation {
  id: string;
  type: "DIRECT" | "GROUP" | "OPDRACHT" | "SUPPORT";
  title?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  participants: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: string;
    };
  }>;
  lastMessage?: {
    content: string;
    sender: {
      name: string;
    };
    createdAt: Date;
  };
  opdracht?: {
    id: string;
    titel: string;
    status: string;
  };
}

interface Message {
  id: string;
  content: string;
  type: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    image?: string;
    role: string;
  };
  createdAt: Date;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
    size: number;
  }>;
}

interface MessagingCenterProps {
  userId: string;
  userRole: string;
}

export function MessagingCenter({ userId, userRole }: MessagingCenterProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchConversations();
    setupRealtimeSubscriptions();

    return () => {
      // Cleanup subscriptions
      supabase.removeAllChannels();
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
      subscribeToConversation(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/messages/conversations");
      const data = await response.json();

      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Kon gesprekken niet laden");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/${conversationId}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Kon berichten niet laden");
    }
  };

  const markAsRead = async (conversationId: string) => {
    // Mark conversation as read locally
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to new conversations
    supabase
      .channel(`user:${userId}:conversations`)
      .on("broadcast", { event: "new_conversation" }, ({ payload }) => {
        setConversations(prev => [payload, ...prev]);
      })
      .subscribe();
  };

  const subscribeToConversation = (conversationId: string) => {
    // Subscribe to conversation updates
    supabase
      .channel(`conversation:${conversationId}`)
      .on("broadcast", { event: "new_message" }, ({ payload }) => {
        if (payload.conversationId === selectedConversation?.id) {
          setMessages(prev => [...prev, payload]);
        } else {
          // Update unread count for other conversations
          setConversations(prev =>
            prev.map(conv =>
              conv.id === payload.conversationId
                ? { ...conv, unreadCount: conv.unreadCount + 1 }
                : conv
            )
          );
        }
      })
      .on("broadcast", { event: "message_edited" }, ({ payload }) => {
        setMessages(prev =>
          prev.map(msg => (msg.id === payload.id ? payload : msg))
        );
      })
      .on("broadcast", { event: "message_deleted" }, ({ payload }) => {
        setMessages(prev =>
          prev.map(msg => (msg.id === payload.id ? payload : msg))
        );
      })
      .subscribe();
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);

      const response = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageInput.trim(),
          type: "TEXT"
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessageInput("");
        // Message will be added via real-time subscription
      } else {
        toast.error(data.error || "Kon bericht niet verzenden");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Er ging iets mis bij het verzenden");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          action: "edit",
          content: editContent
        })
      });

      const data = await response.json();

      if (data.success) {
        setEditingMessage(null);
        setEditContent("");
      } else {
        toast.error(data.error || "Kon bericht niet bewerken");
      }
    } catch (error) {
      console.error("Error editing message:", error);
      toast.error("Er ging iets mis bij het bewerken");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          action: "delete"
        })
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || "Kon bericht niet verwijderen");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Er ging iets mis bij het verwijderen");
    }
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    if (conversation.opdracht) return `Opdracht: ${conversation.opdracht.titel}`;

    const otherParticipants = conversation.participants.filter(
      p => p.user.id !== userId
    );
    return otherParticipants.map(p => p.user.name).join(", ");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ZZP_BEVEILIGER":
        return <Shield className="h-3 w-3" />;
      case "BEDRIJF":
        return <Briefcase className="h-3 w-3" />;
      case "OPDRACHTGEVER":
        return <User className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const filteredConversations = conversations.filter(conv =>
    getConversationTitle(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="h-[600px] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Berichten</h3>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek gesprekken..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-120px)]">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Geen gesprekken gevonden</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map(conversation => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={cn(
                    "w-full p-4 hover:bg-muted/50 transition-colors text-left",
                    selectedConversation?.id === conversation.id && "bg-muted"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={conversation.participants.find(p => p.user.id !== userId)?.user.image}
                      />
                      <AvatarFallback>
                        {conversation.type === "GROUP" ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          getConversationTitle(conversation).charAt(0)
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">
                          {getConversationTitle(conversation)}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      {conversation.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.sender.name}: {conversation.lastMessage.content}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        {conversation.type === "OPDRACHT" && (
                          <Badge variant="outline" className="text-xs">
                            Opdracht
                          </Badge>
                        )}
                        {conversation.lastMessageAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(conversation.lastMessageAt).toLocaleString("nl-NL", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={selectedConversation.participants.find(p => p.user.id !== userId)?.user.image}
                  />
                  <AvatarFallback>
                    {getConversationTitle(selectedConversation).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{getConversationTitle(selectedConversation)}</p>
                  {selectedConversation.type === "OPDRACHT" && selectedConversation.opdracht && (
                    <p className="text-xs text-muted-foreground">
                      Status: {selectedConversation.opdracht.status}
                    </p>
                  )}
                </div>
              </div>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === userId;

                  if (message.isDeleted) {
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className="italic text-muted-foreground text-sm">
                          Bericht verwijderd
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isOwn && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender.image} />
                          <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "max-w-[70%]",
                          isOwn ? "items-end" : "items-start"
                        )}
                      >
                        {!isOwn && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{message.sender.name}</span>
                            {getRoleIcon(message.sender.role)}
                          </div>
                        )}

                        <div
                          className={cn(
                            "rounded-lg px-3 py-2",
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {editingMessage === message.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="bg-background"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleEditMessage(message.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingMessage(null);
                                  setEditContent("");
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm">{message.content}</p>
                              {message.isEdited && (
                                <p className="text-xs opacity-70 mt-1">bewerkt</p>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.createdAt).toLocaleTimeString("nl-NL", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          {isOwn && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  setEditingMessage(message.id);
                                  setEditContent(message.content);
                                }}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button size="icon" variant="ghost">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type een bericht..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={sendingMessage}
                />
                <Button onClick={sendMessage} disabled={sendingMessage || !messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Selecteer een gesprek om te beginnen</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}