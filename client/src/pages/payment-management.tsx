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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Ban,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bitcoin,
  DollarSign,
  Globe,
  Lock,
} from "lucide-react";

interface PaymentProcessor {
  id: string;
  name: string;
  processorType: string;
  status: string;
  isBanned: boolean;
  banReason?: string;
  adultFriendly: boolean;
  supportedCurrencies: string[];
  fees: any;
  geographicRestrictions: string[];
  createdAt: string;
}

interface PaymentTransaction {
  id: string;
  processorId: string;
  externalTransactionId: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  transactionType: string;
  createdAt: string;
}

export default function PaymentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProcessor, setSelectedProcessor] =
    useState<PaymentProcessor | null>(null);
  const [newProcessorName, setNewProcessorName] = useState("");
  const [newProcessorType, setNewProcessorType] = useState("");

  const { data: processors = [], isLoading: processorsLoading } = useQuery<
    PaymentProcessor[]
  >({
    queryKey: ["/api/payment/processors"],
    refetchInterval: 10000,
  });

  const { data: transactions = [] } = useQuery<PaymentTransaction[]>({
    queryKey: ["/api/payment/transactions"],
    refetchInterval: 5000,
  });

  const addProcessorMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      processorType: string;
      adultFriendly: boolean;
    }) => {
      return apiRequest("/api/payment/processors", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment/processors"] });
      setNewProcessorName("");
      setNewProcessorType("");
      toast({
        title: "Processor Added",
        description: "Payment processor added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Processor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddProcessor = () => {
    if (!newProcessorName || !newProcessorType) {
      toast({
        title: "Missing Information",
        description: "Please provide processor name and type",
        variant: "destructive",
      });
      return;
    }

    addProcessorMutation.mutate({
      name: newProcessorName,
      processorType: newProcessorType,
      adultFriendly: true,
    });
  };

  const getProcessorTypeIcon = (type: string) => {
    switch (type) {
      case "crypto":
        return <Bitcoin className="w-4 h-4" />;
      case "traditional":
        return <CreditCard className="w-4 h-4" />;
      case "adult_friendly":
        return <Shield className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (processor: PaymentProcessor) => {
    if (processor.isBanned) {
      return (
        <Badge variant="destructive">
          <Ban className="w-3 h-3 mr-1" />
          BANNED
        </Badge>
      );
    }

    if (!processor.adultFriendly) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          NOT ADULT-FRIENDLY
        </Badge>
      );
    }

    switch (processor.status) {
      case "active":
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="outline">{processor.status}</Badge>;
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-600",
      pending: "bg-yellow-600",
      failed: "bg-red-600",
      refunded: "bg-blue-600",
    } as const;

    return (
      <Badge
        className={variants[status as keyof typeof variants] || "bg-gray-600"}
      >
        {status.toUpperCase()}
      </Badge>
    );
  };

  const bannedProcessors = [
    { name: "Stripe", reason: "Not adult-industry friendly" },
    { name: "PayPal", reason: "Prohibits adult content" },
    { name: "Square", reason: "Adult content restrictions" },
    { name: "Venmo", reason: "Consumer payment app" },
    { name: "Cash App", reason: "Personal payment app" },
  ];

  if (processorsLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading Payment Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold cyber-text-glow">
              Payment Management
            </h1>
            <p className="text-muted-foreground">
              Adult-friendly payment processors only
            </p>
          </div>
          <Badge variant="outline" className="border-red-500 text-red-400">
            <Ban className="w-4 h-4 mr-2" />
            Stripe/PayPal BANNED
          </Badge>
        </div>

        {/* Banned Processors Warning */}
        <Card className="bg-red-900/20 border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-400">
              🚫 Permanently Banned Processors
            </CardTitle>
            <CardDescription className="text-red-300">
              These processors are not allowed and will cause application
              startup failure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bannedProcessors.map((processor) => (
                <div
                  key={processor.name}
                  className="p-3 bg-red-800/30 rounded border border-red-600/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Ban className="w-4 h-4 text-red-400" />
                    <span className="font-semibold text-red-300">
                      {processor.name}
                    </span>
                  </div>
                  <p className="text-xs text-red-400">{processor.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add New Processor */}
          <Card className="bg-gray-900/50 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">
                Add Adult-Friendly Processor
              </CardTitle>
              <CardDescription className="text-gray-400">
                Only adult-industry friendly processors allowed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select
                  value={newProcessorName}
                  onValueChange={setNewProcessorName}
                >
                  <SelectTrigger
                    className="bg-gray-800 border-gray-700"
                    data-testid="select-processor-name"
                  >
                    <SelectValue placeholder="Select adult-friendly processor" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px] overflow-y-auto">
                    <SelectItem value="CCBill">
                      CCBill - Global adult IPSP; ~5–12% fees
                    </SelectItem>
                    <SelectItem value="Segpay">
                      Segpay - Adult specialist; ~4–6% + fee
                    </SelectItem>
                    <SelectItem value="Epoch">
                      Epoch - Adult subscription billing pioneer; ~15%
                      small-volume
                    </SelectItem>
                    <SelectItem value="Verotel">
                      Verotel - Netherlands-based; ~15% low-volume
                    </SelectItem>
                    <SelectItem value="Vendo">
                      Vendo - EU focus; ~5–10%
                    </SelectItem>
                    <SelectItem value="Netbilling">
                      Netbilling - US gateway; ~2.5–5% + $0.25
                    </SelectItem>
                    <SelectItem value="PaymentCloud">
                      PaymentCloud - US-based; ~3–4% + $0.30
                    </SelectItem>
                    <SelectItem value="PayKings">
                      PayKings - High-risk network; ~3–5%
                    </SelectItem>
                    <SelectItem value="Durango Merchant Services">
                      Durango Merchant Services - Offshore; ~4%+
                    </SelectItem>
                    <SelectItem value="Corepay">
                      Corepay - Adult specialists; ~3–5%
                    </SelectItem>
                    <SelectItem value="Instabill">
                      Instabill - Offshore-friendly; ~4–6%
                    </SelectItem>
                    <SelectItem value="Host Merchant Services">
                      Host Merchant Services - US high-risk accounts
                    </SelectItem>
                    <SelectItem value="Payment Nerds">
                      Payment Nerds - No monthly fees; flat ~3.5%
                    </SelectItem>
                    <SelectItem value="SensaPay">
                      SensaPay - Global; ~2.95–5%
                    </SelectItem>
                    <SelectItem value="Tower Payments">
                      Tower Payments - US-based; adult e-commerce focus
                    </SelectItem>
                    <SelectItem value="Zen Payments">
                      Zen Payments - US; ~3%+; OnlyFans-style platforms
                    </SelectItem>
                    <SelectItem value="Easy Pay Direct">
                      Easy Pay Direct - US gateway; $49/mo + ~3–5%
                    </SelectItem>
                    <SelectItem value="eMerchantBroker (EMB)">
                      eMerchantBroker (EMB) - High-risk specialists; 4%+
                    </SelectItem>
                    <SelectItem value="NOWPayments">
                      NOWPayments - Adult-friendly; 100+ cryptos; 0.5% fee
                    </SelectItem>
                    <SelectItem value="CoinPayments">
                      CoinPayments - 75+ cryptos; 0.5–1% fees
                    </SelectItem>
                    <SelectItem value="CoinGate">
                      CoinGate - 1% fee; Bitcoin/Ethereum/etc.
                    </SelectItem>
                    <SelectItem value="BTCPay Server">
                      BTCPay Server - Open-source, self-hosted; 0% fee
                    </SelectItem>
                    <SelectItem value="PayRam">
                      PayRam - Non-custodial; 0% fee
                    </SelectItem>
                    <SelectItem value="Confirmo">
                      Confirmo - EU-based; ~1% fee
                    </SelectItem>
                    <SelectItem value="Paxum Bank">
                      Paxum Bank (Dominica) - Offshore bank for adult industry
                    </SelectItem>
                    <SelectItem value="Yoursafe/Bitsafe">
                      Yoursafe/Bitsafe - Dutch EMI offering IBANs/cards
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={newProcessorType}
                  onValueChange={setNewProcessorType}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Processor category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adult_friendly">
                      Payment Processors & Merchant Accounts
                    </SelectItem>
                    <SelectItem value="crypto">
                      Crypto Payment Solutions
                    </SelectItem>
                    <SelectItem value="bank">
                      Banks & Financial Institutions
                    </SelectItem>
                    <SelectItem value="international">
                      International High-Risk
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleAddProcessor}
                  disabled={addProcessorMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                  data-testid="button-add-processor"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add Processor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Processors */}
          <Card className="bg-gray-900/50 border-cyan-500/20 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-cyan-400">
                Active Payment Processors
              </CardTitle>
              <CardDescription className="text-gray-400">
                Adult-industry approved payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {processors.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No processors configured
                  </p>
                ) : (
                  processors.map((processor) => (
                    <div
                      key={processor.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedProcessor?.id === processor.id
                          ? "bg-cyan-500/20 border-cyan-500/50"
                          : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                      }`}
                      onClick={() => setSelectedProcessor(processor)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getProcessorTypeIcon(processor.processorType)}
                          <span className="font-semibold text-white">
                            {processor.name}
                          </span>
                        </div>
                        {getStatusBadge(processor)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {processor.supportedCurrencies?.length || 0}{" "}
                          currencies
                        </div>
                        <div className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {processor.adultFriendly
                            ? "Adult-Safe"
                            : "Restricted"}
                        </div>
                      </div>

                      {processor.geographicRestrictions?.length > 0 && (
                        <div className="text-xs text-orange-400">
                          Geographic restrictions:{" "}
                          {processor.geographicRestrictions.join(", ")}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-gray-900/50 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-cyan-400">Recent Transactions</CardTitle>
            <CardDescription className="text-gray-400">
              Latest payment activity across all processors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-400">
                      Transaction ID
                    </th>
                    <th className="text-left py-2 text-gray-400">User</th>
                    <th className="text-left py-2 text-gray-400">Amount</th>
                    <th className="text-left py-2 text-gray-400">Type</th>
                    <th className="text-left py-2 text-gray-400">Status</th>
                    <th className="text-left py-2 text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-gray-400"
                      >
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    transactions.slice(0, 10).map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-gray-800"
                      >
                        <td className="py-2 font-mono text-sm text-gray-300">
                          {transaction.externalTransactionId.substring(0, 12)}
                          ...
                        </td>
                        <td className="py-2 text-gray-300">
                          {transaction.userId.substring(0, 8)}...
                        </td>
                        <td className="py-2 text-white font-semibold">
                          {transaction.amount} {transaction.currency}
                        </td>
                        <td className="py-2 text-gray-300 capitalize">
                          {transaction.transactionType}
                        </td>
                        <td className="py-2">
                          {getTransactionStatusBadge(transaction.status)}
                        </td>
                        <td className="py-2 text-gray-400 text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Processor Statistics */}
        <Card className="bg-gray-900/50 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-cyan-400">Payment Statistics</CardTitle>
            <CardDescription className="text-gray-400">
              Adult-friendly payment processor performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {
                    processors.filter(
                      (p) => p.status === "active" && p.adultFriendly,
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-400">Active Adult-Safe</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {
                    processors.filter((p) => p.processorType === "crypto")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-400">Crypto Processors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {transactions.filter((t) => t.status === "completed").length}
                </div>
                <div className="text-sm text-gray-400">
                  Completed Transactions
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {bannedProcessors.length}
                </div>
                <div className="text-sm text-gray-400">Banned Processors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
