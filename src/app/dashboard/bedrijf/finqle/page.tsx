"use client";

import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Euro,
  ExternalLink,
  FileText,
  PieChart,
  RefreshCw,
  Shield,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { BedrijfDashboardLayout } from "@/components/dashboard/BedrijfDashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Transaction {
  id: string;
  type: "invoice" | "payment" | "direct_payment" | "credit";
  description: string;
  amount: number;
  status: "completed" | "pending" | "processing";
  date: string;
  reference: string;
  merchant?: string;
}

interface DirectPaymentRequest {
  id: string;
  merchantName: string;
  amount: number;
  hoursWorked: number;
  shiftDate: string;
  requestDate: string;
  status: "approved" | "pending" | "rejected";
  fee: number;
}

export default function BedrijfFinqlePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data
  const creditLimit = 125000;
  const creditUsed = 48750;
  const creditAvailable = creditLimit - creditUsed;

  const transactions: Transaction[] = [
    {
      id: "1",
      type: "direct_payment",
      description: "Direct payment - Jan de Vries",
      amount: 1250,
      status: "completed",
      date: "2025-01-15T14:30:00",
      reference: "DP-2025-0142",
      merchant: "Jan de Vries",
    },
    {
      id: "2",
      type: "invoice",
      description: "Factuur Amsterdam RAI - Week 2",
      amount: 12500,
      status: "processing",
      date: "2025-01-14T10:00:00",
      reference: "INV-2025-0089",
    },
    {
      id: "3",
      type: "payment",
      description: "Betaling ontvangen - Gemeente Rotterdam",
      amount: -8900,
      status: "completed",
      date: "2025-01-13T16:45:00",
      reference: "PAY-2025-0234",
    },
    {
      id: "4",
      type: "direct_payment",
      description: "Direct payment - Sophie Bakker",
      amount: 890,
      status: "pending",
      date: "2025-01-13T12:00:00",
      reference: "DP-2025-0141",
      merchant: "Sophie Bakker",
    },
    {
      id: "5",
      type: "credit",
      description: "Kredietlimiet verhoogd",
      amount: 25000,
      status: "completed",
      date: "2025-01-10T09:00:00",
      reference: "CR-2025-0012",
    },
  ];

  const directPaymentRequests: DirectPaymentRequest[] = [
    {
      id: "1",
      merchantName: "Jan de Vries",
      amount: 1250,
      hoursWorked: 40,
      shiftDate: "2025-01-08",
      requestDate: "2025-01-15",
      status: "approved",
      fee: 36.25,
    },
    {
      id: "2",
      merchantName: "Sophie Bakker",
      amount: 890,
      hoursWorked: 28,
      shiftDate: "2025-01-10",
      requestDate: "2025-01-13",
      status: "pending",
      fee: 25.81,
    },
    {
      id: "3",
      merchantName: "Mohammed El Idrissi",
      amount: 1560,
      hoursWorked: 48,
      shiftDate: "2025-01-05",
      requestDate: "2025-01-12",
      status: "approved",
      fee: 45.24,
    },
  ];

  const weeklyStats = {
    revenue: 45230,
    directPayments: 12,
    invoicesSent: 8,
    averagePaymentTime: 18,
    totalFees: 423.5,
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return <Badge variant="default">Voltooid</Badge>;
      case "pending":
        return <Badge variant="warning">In Behandeling</Badge>;
      case "processing":
        return <Badge variant="default">Verwerken</Badge>;
      case "rejected":
        return <Badge variant="destructive">Afgewezen</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "direct_payment":
        return <Zap className="h-4 w-4 text-blue-600" />;
      case "invoice":
        return <FileText className="h-4 w-4 text-green-600" />;
      case "payment":
        return <Euro className="h-4 w-4 text-purple-600" />;
      case "credit":
        return <CreditCard className="h-4 w-4 text-orange-600" />;
    }
  };

  return (
    <BedrijfDashboardLayout
      title="Finqle Dashboard"
      subtitle="Beheer financiën en direct payments"
      headerActions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Vernieuwen
          </Button>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Finqle Portal
          </Button>
        </div>
      }
    >
      {/* Credit Overview */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Kredietoverzicht
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time kredietstatus via Finqle
            </p>
          </div>
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Actief
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Kredietlimiet</p>
            <p className="text-2xl font-semibold">
              €{creditLimit.toLocaleString("nl-NL")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Gebruikt</p>
            <p className="text-2xl font-semibold">
              €{creditUsed.toLocaleString("nl-NL")}
            </p>
            <Progress
              value={(creditUsed / creditLimit) * 100}
              className="mt-2"
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Beschikbaar</p>
            <p className="text-2xl font-semibold text-green-600">
              €{creditAvailable.toLocaleString("nl-NL")}
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Week Omzet</p>
              <p className="text-xl font-semibold">
                €{weeklyStats.revenue.toLocaleString("nl-NL")}
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3" />
                +12% vs vorige week
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Direct Payments</p>
              <p className="text-xl font-semibold">
                {weeklyStats.directPayments}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Deze week</p>
            </div>
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Facturen</p>
              <p className="text-xl font-semibold">
                {weeklyStats.invoicesSent}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Verstuurd</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gem. Betaaltijd</p>
              <p className="text-xl font-semibold">
                {weeklyStats.averagePaymentTime}d
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <ArrowDownRight className="h-3 w-3" />
                -3 dagen
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Finqle Fees</p>
              <p className="text-xl font-semibold">€{weeklyStats.totalFees}</p>
              <p className="text-xs text-muted-foreground mt-1">2.9% factor</p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transacties</TabsTrigger>
          <TabsTrigger value="direct-payments">Direct Payments</TabsTrigger>
          <TabsTrigger value="invoices">Facturen</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recente Transacties</h3>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Vandaag</SelectItem>
                    <SelectItem value="week">Deze Week</SelectItem>
                    <SelectItem value="month">Deze Maand</SelectItem>
                    <SelectItem value="quarter">Dit Kwartaal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Omschrijving</TableHead>
                  <TableHead>Referentie</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Bedrag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {getTransactionIcon(transaction.type)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.merchant && (
                          <p className="text-xs text-muted-foreground">
                            {transaction.merchant}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.reference}
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString("nl-NL")}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        transaction.amount < 0 ? "text-green-600" : ""
                      }`}
                    >
                      {transaction.amount < 0 ? "" : "+"}€
                      {Math.abs(transaction.amount).toLocaleString("nl-NL")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="p-4 border-t">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Transacties
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Direct Payments Tab */}
        <TabsContent value="direct-payments">
          <Card>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Direct Payment Aanvragen
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    ZZP'ers krijgen binnen 24 uur uitbetaald via Finqle
                  </p>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Activity className="h-3 w-3" />
                  {
                    directPaymentRequests.filter((r) => r.status === "pending")
                      .length
                  }{" "}
                  in behandeling
                </Badge>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ZZP'er</TableHead>
                  <TableHead>Shift Datum</TableHead>
                  <TableHead>Uren</TableHead>
                  <TableHead>Bedrag</TableHead>
                  <TableHead>Fee (2.9%)</TableHead>
                  <TableHead>Aanvraag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {directPaymentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.merchantName}
                    </TableCell>
                    <TableCell>
                      {new Date(request.shiftDate).toLocaleDateString("nl-NL")}
                    </TableCell>
                    <TableCell>{request.hoursWorked}</TableCell>
                    <TableCell>
                      €{request.amount.toLocaleString("nl-NL")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      €{request.fee.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {new Date(request.requestDate).toLocaleDateString(
                        "nl-NL",
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.status === "pending" ? (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <AlertCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="p-6 border-t bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Totaal Direct Payments deze maand
                  </p>
                  <p className="text-2xl font-semibold">€34.580</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Totale fees</p>
                  <p className="text-lg font-medium">€1.002,82</p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Factuur Overzicht</h3>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Facturen
                </Button>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Nieuwe Factuur
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 border-dashed">
                <p className="text-sm text-muted-foreground">Openstaand</p>
                <p className="text-xl font-semibold">€18.450</p>
                <p className="text-xs text-muted-foreground mt-1">8 facturen</p>
              </Card>

              <Card className="p-4 border-dashed">
                <p className="text-sm text-muted-foreground">Vervallen</p>
                <p className="text-xl font-semibold text-red-600">€3.200</p>
                <p className="text-xs text-muted-foreground mt-1">2 facturen</p>
              </Card>

              <Card className="p-4 border-dashed">
                <p className="text-sm text-muted-foreground">Betaald (30d)</p>
                <p className="text-xl font-semibold text-green-600">€67.890</p>
                <p className="text-xs text-muted-foreground mt-1">
                  23 facturen
                </p>
              </Card>

              <Card className="p-4 border-dashed">
                <p className="text-sm text-muted-foreground">In Verwerking</p>
                <p className="text-xl font-semibold">€12.500</p>
                <p className="text-xs text-muted-foreground mt-1">3 facturen</p>
              </Card>
            </div>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Verdeling Betalingsmethodes
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Direct Payment (24u)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={45} className="w-24" />
                    <span className="text-sm font-medium">45%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Factoring (14d)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={35} className="w-24" />
                    <span className="text-sm font-medium">35%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Regulier (30d)</span>
                  <div className="flex items-center gap-2">
                    <Progress value={20} className="w-24" />
                    <span className="text-sm font-medium">20%</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Klanten (Omzet)
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Amsterdam RAI</span>
                  <span className="text-sm font-medium">€45.230</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gemeente Rotterdam</span>
                  <span className="text-sm font-medium">€38.900</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Media Markt BV</span>
                  <span className="text-sm font-medium">€22.150</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Schiphol Group</span>
                  <span className="text-sm font-medium">€18.670</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </BedrijfDashboardLayout>
  );
}
