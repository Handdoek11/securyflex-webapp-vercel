"use client";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  Euro,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FinqleTransaction {
  id: string;
  type: "payment" | "invoice" | "margin" | "direct_payment";
  description: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  timestamp: Date;
  reference?: string;
}

interface FinqleStatusCardProps {
  bedrijfId?: string;
  compact?: boolean;
}

export function FinqleStatusCard({
  bedrijfId,
  compact = false,
}: FinqleStatusCardProps) {
  const [isConnected, _setIsConnected] = useState(true);
  const [creditLimit, _setCreditLimit] = useState(125000);
  const [creditUsed, _setCreditUsed] = useState(45000);
  const [transactions, setTransactions] = useState<FinqleTransaction[]>([]);
  const [weeklyVolume, _setWeeklyVolume] = useState(22500);
  const [directPaymentEnabled, _setDirectPaymentEnabled] = useState(true);

  // Mock data - will be replaced with real Finqle API
  useEffect(() => {
    // Simulate fetching Finqle data
    setTransactions([
      {
        id: "1",
        type: "payment",
        description: "Jan de Vries - Schiphol T2",
        amount: 450,
        status: "completed",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        reference: "FNQ-2024-0912",
      },
      {
        id: "2",
        type: "invoice",
        description: "Verzamelfactuur Week 37",
        amount: 15892,
        status: "pending",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        reference: "INV-2024-3701",
      },
      {
        id: "3",
        type: "margin",
        description: "Platform marge Week 37",
        amount: 487,
        status: "completed",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        reference: "MARGE-2024-37",
      },
      {
        id: "4",
        type: "direct_payment",
        description: "Direct pay - Maria Jansen",
        amount: 380,
        status: "completed",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        reference: "DP-2024-1823",
      },
    ]);
  }, []);

  const creditPercentage = (creditUsed / creditLimit) * 100;
  const creditAvailable = creditLimit - creditUsed;

  const getTransactionIcon = (type: FinqleTransaction["type"]) => {
    switch (type) {
      case "payment":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "invoice":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "margin":
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case "direct_payment":
        return <Activity className="h-4 w-4 text-orange-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "Zojuist";
    if (hours < 24) return `${hours} uur geleden`;
    const days = Math.floor(hours / 24);
    return `${days} dag${days > 1 ? "en" : ""} geleden`;
  };

  if (compact) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-purple-600" />
            Finqle
          </h3>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600">Live</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Beschikbaar</span>
            <span className="font-semibold">
              €{(creditAvailable / 1000).toFixed(0)}k
            </span>
          </div>
          <Progress value={creditPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {creditPercentage.toFixed(0)}% gebruikt
          </p>
        </div>

        <Button variant="outline" size="sm" className="w-full mt-3" asChild>
          <Link href="/dashboard/bedrijf/finqle">
            Details
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-purple-200 dark:border-purple-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-purple-600" />
          Finqle Payment Platform
        </h3>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="default" className="gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Verbonden
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Geen verbinding
            </Badge>
          )}
        </div>
      </div>

      {/* Credit Overview */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Kredietlimiet</span>
            <span className="text-lg font-bold">
              €{creditLimit.toLocaleString("nl-NL")}
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">Gebruikt</span>
              <span className="text-sm font-semibold text-purple-600">
                €{creditUsed.toLocaleString("nl-NL")}
              </span>
            </div>
            <Progress value={creditPercentage} className="h-2" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm font-medium">
              Beschikbaar voor direct payment
            </span>
            <span className="text-lg font-bold text-green-600">
              €{creditAvailable.toLocaleString("nl-NL")}
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Week volume</span>
          </div>
          <p className="text-lg font-bold">
            €{(weeklyVolume / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" />
            +12% vs vorige week
          </p>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">
              Direct payments
            </span>
          </div>
          <p className="text-lg font-bold">68%</p>
          <p className="text-xs text-muted-foreground mt-1">
            Van alle beveiligers
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Recente Transacties</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-start justify-between p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-start gap-2">
                {getTransactionIcon(transaction.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {transaction.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTimeAgo(transaction.timestamp)}</span>
                    {transaction.reference && (
                      <>
                        <span>•</span>
                        <span>{transaction.reference}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  €{transaction.amount.toLocaleString("nl-NL")}
                </p>
                <Badge
                  variant={
                    transaction.status === "completed"
                      ? "success"
                      : transaction.status === "pending"
                        ? "secondary"
                        : "destructive"
                  }
                  className="text-xs mt-1"
                >
                  {transaction.status === "completed" && "Voltooid"}
                  {transaction.status === "pending" && "In behandeling"}
                  {transaction.status === "failed" && "Mislukt"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/dashboard/bedrijf/finqle">
            <Euro className="h-4 w-4 mr-2" />
            Finqle Dashboard
          </Link>
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/dashboard/bedrijf/finqle/rapporten">Rapporten</Link>
        </Button>
      </div>

      {/* Direct Payment Toggle */}
      {directPaymentEnabled && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Direct Payment actief</span>
            </div>
            <Badge variant="default" className="text-xs">
              Opt-in: 68%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Beveiligers kunnen kiezen voor directe uitbetaling binnen 24 uur
          </p>
        </div>
      )}
    </Card>
  );
}
