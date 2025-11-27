import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Video,
  BookOpen,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  targetElement?: string;
  action?: string;
  completed?: boolean;
}

interface InteractiveTutorialProps {
  tutorialId: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  onComplete?: () => void;
  onClose?: () => void;
}

export function InteractiveTutorial({
  tutorialId,
  title,
  description,
  steps,
  onComplete,
  onClose,
}: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isHighlighting, setIsHighlighting] = useState(false);

  const progress = (completedSteps.size / steps.length) * 100;

  useEffect(() => {
    // Highlight target element when step changes
    if (steps[currentStep]?.targetElement) {
      highlightElement(steps[currentStep].targetElement!);
      setIsHighlighting(true);
    } else {
      clearHighlight();
      setIsHighlighting(false);
    }

    return () => clearHighlight();
  }, [currentStep]);

  const highlightElement = (selector: string) => {
    try {
      const element = document.querySelector(selector);
      if (element) {
        element.classList.add("tutorial-highlight");
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (error) {
      console.error("Error highlighting element:", error);
    }
  };

  const clearHighlight = () => {
    document.querySelectorAll(".tutorial-highlight").forEach((el) => {
      el.classList.remove("tutorial-highlight");
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const handleMarkComplete = () => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isStepCompleted = completedSteps.has(currentStep);

  return (
    <>
      {/* Tutorial Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />

      {/* Tutorial Card */}
      <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[80vh] overflow-auto shadow-2xl z-50 border-2 border-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6" />
              <div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <p className="text-sm text-blue-100 mt-1">{description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-blue-100">
              <span>Progress</span>
              <span>{completedSteps.size} / {steps.length} steps</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Step Navigation */}
          <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all whitespace-nowrap",
                  currentStep === index
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : completedSteps.has(index)
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                )}
              >
                {completedSteps.has(index) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : currentStep === index ? (
                  <PlayCircle className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">Step {index + 1}</span>
              </button>
            ))}
          </div>

          {/* Current Step Content */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Badge
                variant="outline"
                className="mt-1 bg-blue-100 text-blue-700 border-blue-300"
              >
                Step {currentStep + 1} of {steps.length}
              </Badge>
              {isStepCompleted && (
                <Badge variant="outline" className="mt-1 bg-green-100 text-green-700 border-green-300">
                  ✓ Completed
                </Badge>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            {/* Video Tutorial */}
            {currentStepData.videoUrl && (
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="aspect-video relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-16 w-16 text-white/50" />
                  </div>
                  <video
                    src={currentStepData.videoUrl}
                    controls
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Target Element Indicator */}
            {currentStepData.targetElement && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <Target className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Interactive Step</p>
                    <p className="text-sm">
                      The element on the page is highlighted. Follow the instruction above.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Required */}
            {currentStepData.action && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-blue-800">
                  <PlayCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Action Required</p>
                    <p className="text-sm">{currentStepData.action}</p>
                  </div>
                </div>
                {!isStepCompleted && (
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={handleMarkComplete}
                  >
                    Mark as Complete
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {isLastStep && completedSteps.size === steps.length ? (
                <Button
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={onComplete}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Tutorial
                </Button>
              ) : (
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={handleNext}
                >
                  {isLastStep ? "Finish" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSS for highlighting */}
      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5),
                      0 0 0 8px rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          animation: tutorial-pulse 2s infinite;
        }

        @keyframes tutorial-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5),
                        0 0 0 8px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.6),
                        0 0 0 12px rgba(59, 130, 246, 0.4);
          }
        }
      `}</style>
    </>
  );
}

// Tutorial Library with pre-built tutorials
export const TUTORIAL_LIBRARY = {
  "storage-setup": {
    id: "storage-setup",
    title: "Setting Up Cloud Storage",
    description: "Learn how to configure your first cloud storage provider",
    steps: [
      {
        id: "intro",
        title: "Welcome to Storage Setup",
        description: "In this tutorial, you'll learn how to configure a cloud storage provider. We'll walk through each step of adding AWS S3 as your storage backend.",
        videoUrl: "/tutorials/storage-intro.mp4",
      },
      {
        id: "navigate",
        title: "Navigate to Storage Settings",
        description: "First, we need to access the Storage Settings page. Click on Settings > Storage Settings in the navigation menu.",
        targetElement: "a[href='/storage-settings']",
        action: "Click on 'Storage Settings' in the sidebar",
      },
      {
        id: "select-provider",
        title: "Select a Storage Provider",
        description: "You'll see a list of available storage providers. Find 'Amazon S3' in the list and click on it to expand the configuration options.",
        targetElement: "[data-testid='s3-provider-card']",
        action: "Click on the Amazon S3 provider card",
      },
      {
        id: "enter-credentials",
        title: "Enter API Credentials",
        description: "Now enter your AWS Access Key and Secret Key. These can be obtained from your AWS IAM console. Make sure the IAM user has S3 permissions.",
        targetElement: "[data-testid='input-s3-access-key']",
        action: "Enter your AWS credentials",
      },
      {
        id: "test-connection",
        title: "Test Connection",
        description: "Before saving, test the connection to ensure your credentials are correct. Click the 'Test Connection' button.",
        targetElement: "[data-testid='button-test-s3']",
        action: "Click 'Test Connection' and wait for confirmation",
      },
      {
        id: "enable-encryption",
        title: "Enable Encryption (Optional)",
        description: "For added security, you can enable end-to-end encryption. This encrypts files on your device before uploading them to S3.",
        targetElement: "[data-testid='switch-s3-encryption']",
        action: "Toggle encryption if desired",
      },
      {
        id: "set-default",
        title: "Set as Default Provider",
        description: "Finally, set this provider as your default storage location. All new uploads will automatically use this provider.",
        targetElement: "[data-testid='button-set-default-s3']",
        action: "Click 'Set as Default'",
      },
    ],
  },
  "2257-verification": {
    id: "2257-verification",
    title: "Content Creator Verification (2257 Compliance)",
    description: "Complete 2257 compliance verification for content creators",
    steps: [
      {
        id: "intro",
        title: "18 U.S.C. § 2257 Compliance",
        description: "This tutorial covers the complete process of verifying a content creator for 2257 compliance. Federal law requires age verification and record-keeping for all adult content performers.",
        videoUrl: "/tutorials/2257-intro.mp4",
      },
      {
        id: "navigate",
        title: "Access Verification System",
        description: "Navigate to Compliance > Universal 2257 System to access the verification dashboard.",
        targetElement: "a[href='/universal-2257']",
        action: "Click on 'Universal 2257 System'",
      },
      {
        id: "start-verification",
        title: "Start New Verification",
        description: "Click 'New Creator Verification' to begin the process. You'll need to collect specific documents from the performer.",
        action: "Click 'New Creator Verification' button",
      },
      {
        id: "upload-id",
        title: "Upload Government ID",
        description: "Upload a clear photo of the performer's government-issued ID (driver's license, passport, or state ID). The ID must be current and not expired.",
        action: "Upload ID document",
      },
      {
        id: "facial-verification",
        title: "Facial Recognition Check",
        description: "The system will perform automatic facial recognition to match the ID photo with a live photo of the performer. This prevents identity fraud.",
        action: "Wait for AI verification to complete",
      },
      {
        id: "manual-review",
        title: "Manual Review Queue",
        description: "After AI verification, the submission enters a manual review queue where compliance officers verify all documents and information.",
        action: "Review will be completed by compliance team",
      },
      {
        id: "approval",
        title: "Verification Complete",
        description: "Once approved, the creator's 2257 records are generated and stored. They can now publish content on the platform legally and compliantly.",
        action: "Creator is now verified and approved",
      },
    ],
  },
  "payment-setup": {
    id: "payment-setup",
    title: "Payment Processor Configuration",
    description: "Set up payment processing for your platform",
    steps: [
      {
        id: "intro",
        title: "Payment Processing Setup",
        description: "Configure payment processors to accept payments and pay out to creators. We'll set up CCBill, a popular adult-friendly processor.",
      },
      {
        id: "navigate",
        title: "Go to Payment Management",
        description: "Navigate to Finance > Payment Management to access payment processor settings.",
        targetElement: "a[href='/payment-management']",
        action: "Click on 'Payment Management'",
      },
      {
        id: "add-processor",
        title: "Add New Processor",
        description: "Click 'Add Payment Processor' and select CCBill from the list of supported processors.",
        action: "Select CCBill as your processor",
      },
      {
        id: "enter-credentials",
        title: "Enter Merchant Credentials",
        description: "Enter your CCBill merchant account number and API credentials. These are provided by CCBill during onboarding.",
        action: "Enter your CCBill credentials",
      },
      {
        id: "webhook-setup",
        title: "Configure Webhooks",
        description: "Set up webhook endpoints to receive real-time payment notifications. Copy the provided webhook URL to your CCBill account settings.",
        action: "Configure webhook URL in CCBill dashboard",
      },
      {
        id: "test-transaction",
        title: "Test Transaction",
        description: "Process a test transaction to ensure everything is working correctly. Use CCBill's test card numbers.",
        action: "Complete a test payment",
      },
      {
        id: "enable-live",
        title: "Enable Live Mode",
        description: "Once testing is successful, enable live mode to start accepting real payments from users.",
        action: "Toggle 'Live Mode' switch",
      },
    ],
  },
};
