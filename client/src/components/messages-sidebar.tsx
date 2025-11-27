import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";

interface MessagesSidebarProps {
  onBack: () => void;
  onNewMessage: () => void;
  className?: string;
}

export function MessagesSidebar({
  onBack,
  onNewMessage,
  className = "",
}: MessagesSidebarProps) {
  return (
    <Card className={`border-b ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-0"
              data-testid="back-to-previous"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <h5 className="font-bold text-lg">Messages</h5>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onNewMessage}
            className="p-0"
            title="New Message"
            data-testid="new-message-btn"
          >
            <Edit className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default MessagesSidebar;
