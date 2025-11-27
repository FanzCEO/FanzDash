import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { useParams, useLocation } from "wouter";
import {
  ArrowLeft,
  CheckCircle,
  Trash2,
  ExternalLink,
  Eye,
} from "lucide-react";
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

export default function DepositView() {
  const params = useParams();
  const depositId = params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deposit, isLoading } = useQuery({
    queryKey: ["/api/deposits", depositId],
    queryFn: () =>
      fetch(`/api/deposits/${depositId}`).then((res) =>
        res.json(),
      ) as Promise<UserDeposit>,
    enabled: !!depositId,
  });

  const approveMutation = useMutation({
    mutationFn: () =>
      fetch(`/api/deposits/${depositId}/approve`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deposits", depositId] });
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
    mutationFn: () => fetch(`/api/deposits/${depositId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deposits"] });
      toast({
        title: "Success",
        description: "Deposit deleted successfully",
      });
      setLocation("/deposits");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete deposit",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    approveMutation.mutate();
  };

  const handleDelete = () => {
    deleteMutation.mutate();
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!deposit) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Deposit Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The deposit you're looking for doesn't exist.
          </p>
          <Link href="/deposits">
            <Button>Back to Deposits</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/deposits">
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-back-to-deposits"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Deposits
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Deposit Details
            </h1>
            <p className="text-muted-foreground">Deposit #{deposit.id}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="font-medium text-sm text-muted-foreground">ID</dt>
              <dd className="mt-1 font-mono">{deposit.id}</dd>
            </div>

            <div>
              <dt className="font-medium text-sm text-muted-foreground">
                Transaction ID
              </dt>
              <dd className="mt-1">
                {deposit.transactionId !== "null" && deposit.transactionId ? (
                  <span className="font-mono">{deposit.transactionId}</span>
                ) : (
                  <span className="text-muted-foreground">Not Available</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="font-medium text-sm text-muted-foreground">
                User
              </dt>
              <dd className="mt-1">
                {deposit.userId ? (
                  <Link href={`/users/${deposit.userId}`}>
                    <Button variant="link" size="sm" className="p-0 h-auto">
                      {deposit.userId} <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                ) : (
                  <span className="text-muted-foreground">
                    No User Available
                  </span>
                )}
              </dd>
            </div>

            <div>
              <dt className="font-medium text-sm text-muted-foreground">
                Screenshot
              </dt>
              <dd className="mt-1">
                {deposit.metadata?.screenshot_transfer ? (
                  <Button variant="link" size="sm" className="p-0 h-auto">
                    <Eye className="mr-1 h-4 w-4" />
                    View <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                ) : (
                  <span className="text-muted-foreground">No screenshot</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="font-medium text-sm text-muted-foreground">
                Amount
              </dt>
              <dd className="mt-1">
                <span className="text-lg font-semibold text-green-600">
                  ${parseFloat(deposit.amount).toFixed(2)}
                </span>
              </dd>
            </div>

            <div>
              <dt className="font-medium text-sm text-muted-foreground">
                Payment Gateway
              </dt>
              <dd className="mt-1">
                {deposit.method === "Bank Transfer"
                  ? "Bank Transfer"
                  : deposit.method || "Unknown"}
              </dd>
            </div>

            <div>
              <dt className="font-medium text-sm text-muted-foreground">
                Date
              </dt>
              <dd className="mt-1">
                {new Date(deposit.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </div>

            <div>
              <dt className="font-medium text-sm text-muted-foreground">
                Status
              </dt>
              <dd className="mt-1">
                <Badge variant={getStatusColor(deposit.status)}>
                  {getStatusText(deposit.status)}
                </Badge>
              </dd>
            </div>
          </dl>

          {deposit.status === "pending" && (
            <div className="flex gap-4 mt-6 pt-6 border-t">
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                data-testid="button-approve-deposit"
              >
                {approveMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </>
                )}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    data-testid="button-delete-deposit"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Deposit</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this deposit? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
