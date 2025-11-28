import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DetailedReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content?: {
    id: string;
    type: string;
    riskScore?: string;
    pdqHash?: string;
    detections?: Array<{
      label: string;
      confidence: number;
    }>;
  } | null;
}

export function DetailedReviewModal({
  open,
  onOpenChange,
  content,
}: DetailedReviewModalProps) {
  if (!content) return null;

  const handleApproveWithBlur = () => {
    console.log("Approve with blur:", content.id);
    onOpenChange(false);
  };

  const handleBlockContent = () => {
    console.log("Block content:", content.id);
    onOpenChange(false);
  };

  const handleEscalate = () => {
    console.log("Escalate:", content.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detailed Content Review</DialogTitle>
        </DialogHeader>

        {/* Content Preview with Annotations */}
        <div className="mb-6">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              {/* Demonstration of NudeNet bounding box detection */}
              <div className="relative w-full h-full bg-gradient-to-br from-pink-200 to-purple-300">
                <div className="absolute inset-0 blur-sm opacity-70"></div>
                {/* Bounding box overlay */}
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-red-500 rounded-lg">
                  <div className="absolute -top-6 left-0 bg-red-500 text-white px-2 py-1 text-xs rounded">
                    EXPOSED_BREAST_F (0.91)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">NudeNet Analysis</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div className="space-y-1">
                {content.detections?.map((detection, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{detection.label}:</span>
                    <span
                      className={`font-medium ${
                        detection.confidence > 0.8
                          ? "text-red-600"
                          : detection.confidence > 0.6
                            ? "text-yellow-600"
                            : "text-gray-600"
                      }`}
                    >
                      {detection.confidence.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span>Overall Risk:</span>
                  <span className="font-medium text-red-600">HIGH</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">PDQ Hash</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <div className="font-mono text-xs mb-1">
                {content.pdqHash || "f1d2a3b4c5e6f7..."}
              </div>
              <div className="text-green-600 text-xs">✓ No blocklist match</div>
              <div className="text-gray-600 text-xs mt-1">Quality: 0.94</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleApproveWithBlur}
              data-testid="approve-with-blur"
            >
              Approve with Blur
            </Button>
            <Button
              variant="destructive"
              onClick={handleBlockContent}
              data-testid="block-content"
            >
              Block Content
            </Button>
            <Button
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={handleEscalate}
              data-testid="escalate-content"
            >
              Escalate
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="close-modal"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
