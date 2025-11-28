import { useState } from "react";
import { useParams } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  ArrowLeft,
  User,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  ExternalLink,
  CreditCard,
  Bitcoin,
  Building,
  Smartphone,
  Globe,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  profileUrl?: string;
  userFullName?: string;
  userCountry?: string;
  amount: string;
  gateway:
    | "PayPal"
    | "Payoneer"
    | "Zelle"
    | "Western Union"
    | "Bitcoin"
    | "Mercado Pago"
    | "Bank";
  account: string;
  additionalInfo?: {
    cvu?: string; // For Mercado Pago
    documentId?: string; // For Western Union
  };
  status: "pending" | "paid" | "rejected";
  datePaid?: string;
  rejectionReason?: string;
  date: string;
  createdAt: string;
}

export default function WithdrawalView() {
  const { id } = useParams<{ id: string }>();
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock withdrawal request data
  const withdrawalRequest: WithdrawalRequest = {
    id: id || "1",
    userId: "user_1",
    username: "sarah_model",
    profileUrl: "/sarah_model",
    userFullName: "Sarah Johnson",
    userCountry: "United States",
    amount: "250.00",
    gateway: "PayPal",
    account: "sarah@example.com",
    status: "pending",
    date: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-15T10:00:00Z",
  };

  const markPaidMutation = useMutation({
    mutationFn: (withdrawalId: string) =>
      apiRequest(`/api/admin/withdrawals/${withdrawalId}/mark-paid`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ title: "Withdrawal marked as paid successfully" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (data: { withdrawalId: string; reason: string }) =>
      apiRequest(`/api/admin/withdrawals/${data.withdrawalId}/reject`, "POST", {
        reason: data.reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      toast({ title: "Withdrawal rejected successfully" });
      setIsRejectDialogOpen(false);
      setRejectReason("");
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const getGatewayIcon = (gateway: string) => {
    switch (gateway) {
      case "PayPal":
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case "Payoneer":
        return <CreditCard className="h-5 w-5 text-orange-500" />;
      case "Zelle":
        return <Smartphone className="h-5 w-5 text-purple-600" />;
      case "Western Union":
        return <Globe className="h-5 w-5 text-yellow-600" />;
      case "Bitcoin":
        return <Bitcoin className="h-5 w-5 text-orange-400" />;
      case "Mercado Pago":
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case "Bank":
        return <Building className="h-5 w-5 text-green-600" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "outline",
      paid: "default",
      rejected: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status === "pending"
          ? "Pending to Pay"
          : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getGatewayFieldLabel = (gateway: string) => {
    switch (gateway) {
      case "PayPal":
        return "PayPal Account";
      case "Payoneer":
        return "Payoneer Account";
      case "Zelle":
        return "Zelle Account";
      case "Western Union":
        return "Document ID";
      case "Bitcoin":
        return "Bitcoin Wallet";
      case "Mercado Pago":
        return "Alias MP";
      case "Bank":
        return "Bank Details";
      default:
        return "Account";
    }
  };

  const renderGatewaySpecificFields = () => {
    switch (withdrawalRequest.gateway) {
      case "Western Union":
        return (
          <>
            <div className="grid grid-cols-3 gap-4 py-3 border-b">
              <dt className="text-sm font-medium text-muted-foreground">
                Full Name
              </dt>
              <dd className="text-sm col-span-2">
                {withdrawalRequest.userFullName || "No Available"}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-4 py-3 border-b">
              <dt className="text-sm font-medium text-muted-foreground">
                Country
              </dt>
              <dd className="text-sm col-span-2">
                {withdrawalRequest.userCountry || "No Available"}
              </dd>
            </div>
          </>
        );
      case "Mercado Pago":
        return (
          <div className="grid grid-cols-3 gap-4 py-3 border-b">
            <dt className="text-sm font-medium text-muted-foreground">
              No. CVU
            </dt>
            <dd className="text-sm col-span-2">
              {withdrawalRequest.additionalInfo?.cvu || "No Available"}
            </dd>
          </div>
        );
      default:
        return null;
    }
  };

  const handleMarkPaid = () => {
    markPaidMutation.mutate(withdrawalRequest.id);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast({
        title: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({
      withdrawalId: withdrawalRequest.id,
      reason: rejectReason,
    });
  };

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="withdrawal-view"
    >
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <span className="mx-2">›</span>
        <Link href="/withdrawal-management" className="hover:text-foreground">
          Withdrawals
        </Link>
        <span className="mx-2">›</span>
        <span className="text-foreground">#{withdrawalRequest.id}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-text-glow">
            Withdrawal Request #{withdrawalRequest.id}
          </h1>
          <p className="text-muted-foreground">
            Detailed view and processing controls for withdrawal request
          </p>
        </div>
        <Link href="/withdrawal-management">
          <Button variant="outline" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Withdrawals
          </Button>
        </Link>
      </div>

      <Card className="cyber-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getGatewayIcon(withdrawalRequest.gateway)}
              <div>
                <CardTitle>Withdrawal Details</CardTitle>
                <CardDescription>
                  {withdrawalRequest.gateway === "Bank"
                    ? "Bank Transfer"
                    : withdrawalRequest.gateway}{" "}
                  withdrawal request
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(withdrawalRequest.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Information */}
          <div className="grid grid-cols-3 gap-4 py-3 border-b">
            <dt className="text-sm font-medium text-muted-foreground">User</dt>
            <dd className="text-sm col-span-2">
              {withdrawalRequest.profileUrl ? (
                <Link href={withdrawalRequest.profileUrl}>
                  <Button variant="link" className="p-0 h-auto text-left">
                    {withdrawalRequest.username}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              ) : (
                <span className="text-muted-foreground">No Available</span>
              )}
            </dd>
          </div>

          {/* Gateway-specific fields */}
          {renderGatewaySpecificFields()}

          {/* Account Details */}
          <div className="grid grid-cols-3 gap-4 py-3 border-b">
            <dt className="text-sm font-medium text-muted-foreground">
              {getGatewayFieldLabel(withdrawalRequest.gateway)}
            </dt>
            <dd className="text-sm col-span-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono bg-muted px-2 py-1 rounded">
                  {withdrawalRequest.account}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(withdrawalRequest.account)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </dd>
          </div>

          {/* Amount */}
          <div className="grid grid-cols-3 gap-4 py-3 border-b">
            <dt className="text-sm font-medium text-muted-foreground">
              Amount
            </dt>
            <dd className="text-sm col-span-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-xl font-bold text-green-600">
                  ${withdrawalRequest.amount}
                </span>
              </div>
            </dd>
          </div>

          {/* Date */}
          <div className="grid grid-cols-3 gap-4 py-3 border-b">
            <dt className="text-sm font-medium text-muted-foreground">Date</dt>
            <dd className="text-sm col-span-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(withdrawalRequest.date).toLocaleDateString(
                    "en-US",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </span>
              </div>
            </dd>
          </div>

          {/* Status */}
          <div className="grid grid-cols-3 gap-4 py-3 border-b">
            <dt className="text-sm font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="text-sm col-span-2">
              {getStatusBadge(withdrawalRequest.status)}
            </dd>
          </div>

          {/* Date Paid (if paid) */}
          {withdrawalRequest.status === "paid" &&
            withdrawalRequest.datePaid && (
              <div className="grid grid-cols-3 gap-4 py-3 border-b">
                <dt className="text-sm font-medium text-muted-foreground">
                  Date Paid
                </dt>
                <dd className="text-sm col-span-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      {new Date(withdrawalRequest.datePaid).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </dd>
              </div>
            )}

          {/* Rejection Reason (if rejected) */}
          {withdrawalRequest.status === "rejected" &&
            withdrawalRequest.rejectionReason && (
              <div className="grid grid-cols-3 gap-4 py-3 border-b">
                <dt className="text-sm font-medium text-muted-foreground">
                  Rejection Reason
                </dt>
                <dd className="text-sm col-span-2">
                  <div className="flex items-start space-x-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <span className="text-red-600">
                      {withdrawalRequest.rejectionReason}
                    </span>
                  </div>
                </dd>
              </div>
            )}

          {/* Actions for pending withdrawals */}
          {withdrawalRequest.status === "pending" &&
            withdrawalRequest.profileUrl && (
              <div className="flex items-center space-x-4 pt-4 border-t">
                <Button
                  onClick={handleMarkPaid}
                  disabled={markPaidMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-mark-paid"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Paid
                </Button>

                <Dialog
                  open={isRejectDialogOpen}
                  onOpenChange={setIsRejectDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" data-testid="button-reject">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Withdrawal</DialogTitle>
                      <DialogDescription>
                        Please provide a reason for rejecting this withdrawal
                        request.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reason">Rejection Reason</Label>
                        <Textarea
                          id="reason"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Enter reason for rejection..."
                          maxLength={250}
                          rows={4}
                          data-testid="textarea-reject-reason"
                        />
                        <p className="text-xs text-muted-foreground">
                          This information will be sent to the user to explain
                          why their withdrawal was rejected.
                        </p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsRejectDialogOpen(false)}
                          data-testid="button-cancel-reject"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={
                            rejectMutation.isPending || !rejectReason.trim()
                          }
                          data-testid="button-confirm-reject"
                        >
                          Reject Withdrawal
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Payment Processing Guidelines */}
      <Card className="cyber-border border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">
                Payment Processing Guidelines
              </h3>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>
                  • Verify user identity and account details before processing
                </li>
                <li>
                  • Ensure compliance with payment gateway terms and conditions
                </li>
                <li>
                  • Document transaction IDs and processing notes for audit
                  trails
                </li>
                <li>
                  • Check for suspicious activity or unusual withdrawal patterns
                </li>
                <li>
                  • Adult content creators may have special withdrawal
                  restrictions
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
