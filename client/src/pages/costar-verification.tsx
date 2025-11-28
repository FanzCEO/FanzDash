import { CoStarVerificationForm } from "@/components/CoStarVerificationForm";
import { SEOHeadTags } from "@/components/SEOHeadTags";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function CoStarVerificationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitVerificationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/costar-verification", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/costar-verification"] });
      queryClient.invalidateQueries({ queryKey: ["/api/verification/requests"] });
      toast({
        title: "Verification Submitted",
        description: "Co-Star verification form has been submitted successfully and is pending review.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "An error occurred while submitting the form.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen cyber-bg p-4 md:p-6 lg:p-8">
      <SEOHeadTags
        title="Co-Star Verification - FANZ™ Group Holdings LLC"
        description="Adult Co-Star Model Release + 2257 Compliance & Collaboration Agreement"
        canonicalUrl="https://fanzdash.com/costar-verification"
      />

      <CoStarVerificationForm
        mode="production"
        onSubmit={(data) => submitVerificationMutation.mutate(data)}
      />
    </div>
  );
}
