import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  FileText,
  User,
  Calendar,
  Shield,
} from "lucide-react";

const verification2257Schema = z.object({
  stageName: z.string().min(1, "Stage name is required"),
  legalName: z.string().min(1, "Legal name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal/ZIP code is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  idFrontImageUrl: z.string().optional(),
  idBackImageUrl: z.string().optional(),
  holdingIdImageUrl: z.string().optional(),
  w9FormUrl: z.string().optional(),
});

type Verification2257Form = z.infer<typeof verification2257Schema>;

interface Verification2257 {
  id: string;
  stageName: string;
  legalName: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  status: "pending" | "verified" | "declined";
  actionTakenBy?: string;
  actionReason?: string;
  actionType?: string;
  submittedAt: string;
  processedAt?: string;
  dateOfBirth: string;
  idFrontImageUrl?: string;
  idBackImageUrl?: string;
  holdingIdImageUrl?: string;
  w9FormUrl?: string;
}

export default function Verification2257() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVerification, setSelectedVerification] = useState<
    string | null
  >(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const form = useForm<Verification2257Form>({
    resolver: zodResolver(verification2257Schema),
    defaultValues: {
      stageName: "",
      legalName: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      dateOfBirth: "",
    },
  });

  const { data: verifications = [], isLoading } = useQuery<Verification2257[]>({
    queryKey: ["/api/2257-verifications"],
  });

  const createVerificationMutation = useMutation({
    mutationFn: async (data: Verification2257Form) => {
      return apiRequest("/api/2257-verifications", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/2257-verifications"] });
      form.reset();
      toast({
        title: "Verification Submitted",
        description: "2257 verification form has been submitted for review",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateVerificationMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: string;
      reason?: string;
    }) => {
      return apiRequest(`/api/2257-verifications/${id}`, "PATCH", {
        status,
        actionReason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/2257-verifications"] });
      toast({
        title: "Verification Updated",
        description: "Verification status has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload =
    (fieldName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // For now, just store the file name as a placeholder
        // In a real app, you'd upload to a server and get a URL back
        form.setValue(fieldName as keyof Verification2257Form, file.name);
        toast({
          title: "File Selected",
          description: `${fieldName} selected: ${file.name}`,
        });
      }
    };

  const handleApprove = (id: string) => {
    updateVerificationMutation.mutate({ id, status: "verified" });
  };

  const handleDecline = (id: string, reason: string) => {
    updateVerificationMutation.mutate({ id, status: "declined", reason });
  };

  const onSubmit = (data: Verification2257Form) => {
    createVerificationMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "declined":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 cyber-pulse text-primary" />
          <p className="cyber-text-glow">Loading 2257 Verification System...</p>
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
              2257 Record Verification
            </h1>
            <p className="text-muted-foreground">
              Age Verification & Compliance Documentation
            </p>
          </div>
          <Badge variant="outline" className="border-cyan-500 text-cyan-400">
            <Shield className="w-4 h-4 mr-2" />
            Legal Compliance
          </Badge>
        </div>

        {/* Verification Form */}
        <Card className="bg-gray-900/50 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-cyan-400">
              Submit New Verification
            </CardTitle>
            <CardDescription className="text-gray-400">
              Complete age verification and compliance documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="stageName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-400">
                          Stage/Performance Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-gray-800 border-gray-700"
                            data-testid="input-stage-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="legalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-400">
                          Legal Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-gray-800 border-gray-700"
                            data-testid="input-legal-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-400">
                          Date of Birth
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className="bg-gray-800 border-gray-700"
                            data-testid="input-dob"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-400">Country</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-gray-800 border-gray-700"
                            data-testid="input-country"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-400">Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-gray-800 border-gray-700"
                            data-testid="input-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-400">City</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-gray-800 border-gray-700"
                            data-testid="input-city"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-cyan-400">
                          Postal/ZIP Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-gray-800 border-gray-700"
                            data-testid="input-postal-code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Document Upload Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-cyan-400">
                    Required Documentation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-cyan-400">ID Front Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload("idFrontImageUrl")}
                        className="bg-gray-800 border-gray-700"
                        data-testid="input-id-front"
                      />
                      {form.watch("idFrontImageUrl") && (
                        <p className="text-green-400 text-sm">
                          ✓ ID front selected
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label className="text-cyan-400">ID Back Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload("idBackImageUrl")}
                        className="bg-gray-800 border-gray-700"
                        data-testid="input-id-back"
                      />
                      {form.watch("idBackImageUrl") && (
                        <p className="text-green-400 text-sm">
                          ✓ ID back selected
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label className="text-cyan-400">Holding ID Photo</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload("holdingIdImageUrl")}
                        className="bg-gray-800 border-gray-700"
                        data-testid="input-holding-id"
                      />
                      {form.watch("holdingIdImageUrl") && (
                        <p className="text-green-400 text-sm">
                          ✓ Holding ID photo selected
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label className="text-cyan-400">
                        W-9 Form (Optional)
                      </Label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload("w9FormUrl")}
                        className="bg-gray-800 border-gray-700"
                        data-testid="input-w9-form"
                      />
                      {form.watch("w9FormUrl") && (
                        <p className="text-green-400 text-sm">
                          ✓ W-9 form selected
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  disabled={createVerificationMutation.isPending}
                  data-testid="button-submit-verification"
                >
                  {createVerificationMutation.isPending
                    ? "Submitting..."
                    : "Submit Verification"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Verification List */}
        <Card className="bg-gray-900/50 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-cyan-400">
              Recent Verifications
            </CardTitle>
            <CardDescription className="text-gray-400">
              Review and manage 2257 form submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {verifications.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No verifications submitted yet
                </p>
              ) : (
                verifications.map((verification) => (
                  <div
                    key={verification.id}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-white">
                          {verification.stageName}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {verification.legalName}
                        </p>
                      </div>
                      {getStatusBadge(verification.status)}
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Submitted:{" "}
                      {new Date(verification.submittedAt).toLocaleDateString()}
                    </p>

                    {verification.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(verification.id)}
                          data-testid={`button-approve-${verification.id}`}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                          onClick={() =>
                            handleDecline(
                              verification.id,
                              "Documentation incomplete",
                            )
                          }
                          data-testid={`button-decline-${verification.id}`}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
