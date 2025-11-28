import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, CheckCircle, Trash2, ExternalLink } from "lucide-react";
import { Link } from "wouter";

interface UserDeposit {
  id: string;
  userId: string;
  amount: string;
  currency: string;
  processorId: string;
  transactionId: string;
  status: "pending" | "completed" | "failed" | "refunded";
  method: string;
  processorFee: string;
  netAmount: string;
  metadata: any;
  confirmationHash: string;
  createdAt: string;
  updatedAt: string;
}

export default function DepositsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deposits = [], isLoading } = useQuery({
    queryKey: ["/api/deposits", searchQuery],
    queryFn: () => {
      const url = searchQuery
        ? `/api/deposits?q=${encodeURIComponent(searchQuery)}`
        : "/api/deposits";
      return fetch(url).then((res) => res.json()) as Promise<UserDeposit[]>;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/deposits/${id}/approve`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      toast({
        title: "Success",
        description: "Deposit approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve deposit",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/deposits/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      toast({
        title: "Success",
        description: "Deposit deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete deposit",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      case "refunded":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Success";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      case "refunded":
        return "Refunded";
      default:
        return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Deposits Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage user deposits ({deposits.length} total)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                data-testid="input-search-deposits"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : deposits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No deposits found matching your search."
                : "No deposits found."}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-4 px-4 py-2 bg-muted rounded-lg font-medium text-sm">
                <div>ID</div>
                <div>User ID</div>
                <div>Transaction ID</div>
                <div>Amount</div>
                <div>Payment Gateway</div>
                <div>Date</div>
                <div>Status</div>
              </div>

              {deposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="grid grid-cols-7 gap-4 px-4 py-3 border rounded-lg hover:bg-gray-50"
                  data-testid={`card-deposit-${deposit.id}`}
                >
                  <div className="text-sm font-mono">
                    {deposit.id.substring(0, 8)}...
                  </div>
                  <div className="text-sm">
                    {deposit.userId ? (
                      <Link href={`/users/${deposit.userId}`}>
                        <Button variant="link" size="sm" className="p-0 h-auto">
                          {deposit.userId.substring(0, 8)}...{" "}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">No user</span>
                    )}
                  </div>
                  <div className="text-sm">
                    {deposit.status === "pending" ? (
                      <span className="font-mono">
                        {deposit.transactionId || "—"}
                      </span>
                    ) : (
                      <Link href={`/deposits/invoice/${deposit.id}`}>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto font-mono"
                        >
                          {deposit.transactionId || "—"}{" "}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    ${parseFloat(deposit.amount).toFixed(2)}
                  </div>
                  <div className="text-sm">{deposit.method || "Unknown"}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(deposit.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(deposit.status)}>
                      {getStatusText(deposit.status)}
                    </Badge>
                    {(deposit.method === "Bank Transfer" ||
                      deposit.method === "Bank") && (
                      <Link href={`/deposits/${deposit.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-view-deposit-${deposit.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {deposit.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(deposit.id)}
                          disabled={approveMutation.isPending}
                          data-testid={`button-approve-deposit-${deposit.id}`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-delete-deposit-${deposit.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Deposit
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this deposit?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(deposit.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
