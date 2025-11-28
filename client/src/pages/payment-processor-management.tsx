import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Check,
  X,
  Plus,
  Settings,
  CreditCard,
  Bitcoin,
  Globe,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PaymentProcessor {
  id: string;
  name: string;
  slug: string;
  processorType: "crypto" | "traditional" | "adult_friendly" | "regional";
  region: string;
  status: "active" | "inactive" | "banned";
  isBanned: boolean;
  adultFriendly: boolean;
  supportedCurrencies: string[];
  fees?: any;
  processingTime: string;
  minimumAmount?: string;
  maximumAmount?: string;
  testMode: boolean;
}

export default function PaymentProcessorManagement() {
  const [selectedProcessor, setSelectedProcessor] =
    useState<PaymentProcessor | null>(null);
  const queryClient = useQueryClient();

  // Mock data demonstrating comprehensive payment processor ecosystem
  const processors = [
    {
      id: "1",
      name: "CCBill",
      slug: "ccbill",
      processorType: "adult_friendly" as const,
      region: "Global",
      status: "active" as const,
      isBanned: false,
      adultFriendly: true,
      supportedCurrencies: ["USD", "EUR", "GBP"],
      processingTime: "1-3 days",
      testMode: false,
    },
    {
      id: "2",
      name: "Segpay",
      slug: "segpay",
      processorType: "adult_friendly" as const,
      region: "Global",
      status: "active" as const,
      isBanned: false,
      adultFriendly: true,
      supportedCurrencies: ["USD", "EUR"],
      processingTime: "2-5 days",
      testMode: false,
    },
    {
      id: "3",
      name: "Epoch",
      slug: "epoch",
      processorType: "adult_friendly" as const,
      region: "Global",
      status: "active" as const,
      isBanned: false,
      adultFriendly: true,
      supportedCurrencies: ["USD", "EUR", "CAD"],
      processingTime: "1-2 days",
      testMode: false,
    },
    {
      id: "4",
      name: "Binance",
      slug: "binance",
      processorType: "crypto" as const,
      region: "Global",
      status: "active" as const,
      isBanned: false,
      adultFriendly: true,
      supportedCurrencies: ["BTC", "ETH", "BNB", "USDT"],
      processingTime: "instant",
      testMode: false,
    },
    {
      id: "5",
      name: "Coinbase",
      slug: "coinbase",
      processorType: "crypto" as const,
      region: "Global",
      status: "active" as const,
      isBanned: false,
      adultFriendly: true,
      supportedCurrencies: ["BTC", "ETH", "USDC"],
      processingTime: "instant",
      testMode: false,
    },
    {
      id: "6",
      name: "Flutterwave",
      slug: "flutterwave",
      processorType: "regional" as const,
      region: "Africa",
      status: "active" as const,
      isBanned: false,
      adultFriendly: true,
      supportedCurrencies: ["USD", "NGN", "KES"],
      processingTime: "1-3 days",
      testMode: false,
    },
    {
      id: "7",
      name: "MercadoPago",
      slug: "mercadopago",
      processorType: "regional" as const,
      region: "LatAm",
      status: "active" as const,
      isBanned: false,
      adultFriendly: true,
      supportedCurrencies: ["USD", "ARS", "BRL"],
      processingTime: "1-2 days",
      testMode: false,
    },
    {
      id: "8",
      name: "NowPayments",
      slug: "nowpayments",
      processorType: "crypto" as const,
      region: "Global",
      status: "active" as const,
      isBanned: false,
      adultFriendly: true,
      supportedCurrencies: ["BTC", "ETH", "USDT", "LTC", "XMR"],
      processingTime: "instant",
      testMode: false,
    },
    {
      id: "9",
      name: "OpenPix",
      slug: "openpix",
      processorType: "regional" as const,
      region: "Brazil",
      status: "active" as const,
      isBanned: false,
      adultFriendly: true,
      supportedCurrencies: ["BRL", "USD"],
      processingTime: "instant",
      testMode: false,
    },
    {
      id: "10",
      name: "Payku",
      slug: "payku",
      processorType: "regional" as const,
      region: "Chile",
      status: "active" as const,
      isBanned: false,
      adultFriendly: true,
      supportedCurrencies: ["CLP", "USD"],
      processingTime: "1-2 days",
      testMode: false,
    },
    {
      id: "11",
      name: "Paystack",
      slug: "paystack",
      processorType: "regional" as const,
      region: "Africa",
      status: "active" as const,
      isBanned: false,
      adultFriendly: true,
      supportedCurrencies: ["NGN", "GHS", "USD"],
      processingTime: "1-3 days",
      testMode: false,
    },
    {
      id: "12",
      name: "Mollie",
      slug: "mollie",
      processorType: "regional" as const,
      region: "Europe",
      status: "active" as const,
      isBanned: false,
      adultFriendly: true,
      supportedCurrencies: ["EUR", "USD", "GBP"],
      processingTime: "1-2 days",
      testMode: false,
    },
  ];
  const isLoading = false;

  const { toast } = useToast();

  const updateProcessorMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<PaymentProcessor> }) =>
      apiRequest(
        `/api/admin/payment-processors/${data.id}`,
        "PATCH",
        data.updates,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/payment-processors"],
      });
      toast({ title: "Payment processor updated successfully" });
    },
  });

  const bannedProcessors = [
    {
      name: "Stripe",
      reason: "Adult content policy violation",
      type: "traditional",
    },
    {
      name: "PayPal",
      reason: "Adult content policy violation",
      type: "traditional",
    },
    {
      name: "Square",
      reason: "Adult content restrictions",
      type: "traditional",
    },
    {
      name: "Venmo",
      reason: "Adult content policy violation",
      type: "traditional",
    },
  ];

  const adultFriendlyProcessors = processors.filter(
    (p) => p.adultFriendly && !p.isBanned,
  );
  const cryptoProcessors = processors.filter(
    (p) => p.processorType === "crypto",
  );
  const regionalProcessors = processors.filter(
    (p) => p.processorType === "regional",
  );

  const getProcessorIcon = (type: string) => {
    switch (type) {
      case "crypto":
        return <Bitcoin className="h-4 w-4" />;
      case "regional":
        return <Globe className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (processor: PaymentProcessor) => {
    if (processor.isBanned) return <Badge variant="destructive">Banned</Badge>;
    if (processor.status === "active")
      return <Badge variant="default">Active</Badge>;
    if (processor.status === "inactive")
      return <Badge variant="secondary">Inactive</Badge>;
    return <Badge variant="outline">{processor.status}</Badge>;
  };

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="payment-processor-management"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Processor Management</h1>
          <p className="text-muted-foreground">
            Manage adult-friendly payment processors and enforce compliance
            policies
          </p>
        </div>
        <Button data-testid="button-add-processor">
          <Plus className="h-4 w-4 mr-2" />
          Add Processor
        </Button>
      </div>

      {/* Banned Processors Warning */}
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Banned Payment Processors
          </CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            These processors are automatically blocked due to adult content
            policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bannedProcessors.map((processor, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border"
              >
                <div className="flex items-center">
                  <X className="h-4 w-4 text-red-500 mr-2" />
                  <span className="font-medium">{processor.name}</span>
                </div>
                <Badge variant="destructive">Banned</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="adult-friendly" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="adult-friendly">
            Adult-Friendly ({adultFriendlyProcessors.length})
          </TabsTrigger>
          <TabsTrigger value="crypto">
            Crypto ({cryptoProcessors.length})
          </TabsTrigger>
          <TabsTrigger value="regional">
            Regional ({regionalProcessors.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Processors ({processors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="adult-friendly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adult-Friendly Payment Processors</CardTitle>
              <CardDescription>
                Payment processors that support adult content and creator
                economy platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Processor</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Currencies</TableHead>
                    <TableHead>Processing Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adultFriendlyProcessors.map(
                    (processor: PaymentProcessor) => (
                      <TableRow key={processor.id}>
                        <TableCell className="flex items-center">
                          {getProcessorIcon(processor.processorType)}
                          <span className="ml-2 font-medium">
                            {processor.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{processor.region}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {processor.supportedCurrencies
                              .slice(0, 3)
                              .map((currency) => (
                                <Badge
                                  key={currency}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {currency}
                                </Badge>
                              ))}
                            {processor.supportedCurrencies.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{processor.supportedCurrencies.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{processor.processingTime}</TableCell>
                        <TableCell>{getStatusBadge(processor)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-configure-${processor.slug}`}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bitcoin className="h-5 w-5 mr-2" />
                Cryptocurrency Processors
              </CardTitle>
              <CardDescription>
                Crypto payment gateways for anonymous and decentralized
                transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {cryptoProcessors.map((processor: PaymentProcessor) => (
                  <div
                    key={processor.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center">
                      <Bitcoin className="h-8 w-8 text-orange-500 mr-3" />
                      <div>
                        <h3 className="font-medium">{processor.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Supports {processor.supportedCurrencies.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(processor)}
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Regional Payment Processors
              </CardTitle>
              <CardDescription>
                Localized payment solutions for specific geographic regions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionalProcessors.map((processor: PaymentProcessor) => (
                  <Card key={processor.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{processor.name}</h3>
                      {getStatusBadge(processor)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Region: {processor.region}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Processing: {processor.processingTime}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Settings
                    </Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Payment Processors</CardTitle>
              <CardDescription>
                Complete overview of all payment processing integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Processor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Adult Friendly</TableHead>
                    <TableHead>Test Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processors.map((processor: PaymentProcessor) => (
                    <TableRow key={processor.id}>
                      <TableCell className="flex items-center">
                        {getProcessorIcon(processor.processorType)}
                        <span className="ml-2 font-medium">
                          {processor.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {processor.processorType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {processor.adultFriendly ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        {processor.testMode ? (
                          <Badge variant="secondary">Test</Badge>
                        ) : (
                          <Badge variant="default">Live</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(processor)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Settings
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
