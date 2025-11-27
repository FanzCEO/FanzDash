import { ContentCreatorVerificationForm } from "@/components/ContentCreatorVerificationForm";
import { SEOHeadTags } from "@/components/SEOHeadTags";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ContentCreatorVerificationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitVerificationMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/creator-verification", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator-verification"] });
      queryClient.invalidateQueries({ queryKey: ["/api/verification/requests"] });
      toast({
        title: "Verification Submitted",
        description: "Content Creator verification has been submitted successfully and is pending review.",
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
        title="Content Creator Verification - FANZ™ Group Holdings LLC"
        description="Content Creator Identity Verification, 2257 Compliance, and Platform Agreement"
        canonicalUrl="https://fanzdash.com/creator-verification"
      />

      <ContentCreatorVerificationForm
        onSubmit={(data) => submitVerificationMutation.mutate(data)}
      />
    </div>
  );
}
