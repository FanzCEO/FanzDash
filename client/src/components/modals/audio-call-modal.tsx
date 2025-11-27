import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  DollarSign,
} from "lucide-react";

interface AudioCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callType: "incoming" | "outgoing" | "active";
  caller: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  };
  callData?: {
    duration?: number;
    pricePerMinute?: number;
    totalAmount?: number;
    currencySymbol: string;
  };
  onAccept?: () => void;
  onReject?: () => void;
  onHangup?: () => void;
  onToggleMic?: () => void;
  onToggleVolume?: () => void;
  isMuted?: boolean;
  isVolumeOff?: boolean;
  className?: string;
}

export function AudioCallModal({
  isOpen,
  onClose,
  callType,
  caller,
  callData,
  onAccept,
  onReject,
  onHangup,
  onToggleMic,
  onToggleVolume,
  isMuted = false,
  isVolumeOff = false,
  className = "",
}: AudioCallModalProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (callType === "active") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callType]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAccept = () => {
    setIsConnecting(true);
    onAccept?.();
  };

  const handleReject = () => {
    onReject?.();
    onClose();
  };

  const handleHangup = () => {
    onHangup?.();
    onClose();
  };

  const getCallStatus = () => {
    switch (callType) {
      case "incoming":
        return `${caller.username} is calling you`;
      case "outgoing":
        return isConnecting ? "Connecting..." : "Please wait for answer";
      case "active":
        return `Connected - ${formatDuration(callDuration)}`;
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-gradient-to-b from-blue-50 to-blue-100 border-blue-200">
        <div className="text-center space-y-6 p-4">
          {/* Profile Image */}
          <div className="relative inline-block">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={caller.avatar} />
              <AvatarFallback className="text-2xl">
                {caller.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Call status indicator */}
            {callType === "active" && (
              <div className="absolute -bottom-2 -right-2">
                <Badge variant="default" className="bg-green-500 animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full mr-1" />
                  LIVE
                </Badge>
              </div>
            )}
          </div>

          {/* Caller Info */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {callType === "incoming" ? "Incoming Audio Call" : caller.name}
            </h3>
            <p className="text-gray-600">{getCallStatus()}</p>

            {/* Call pricing info */}
            {callData && callType === "incoming" && (
              <div className="bg-white p-3 rounded-lg">
                <div className="flex items-center justify-center space-x-1 text-primary">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">
                    {callData.currencySymbol}
                    {callData.totalAmount?.toFixed(2)}
                  </span>
                </div>
                {callData.pricePerMinute && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {callData.currencySymbol}
                    {callData.pricePerMinute}/minute
                  </p>
                )}
              </div>
            )}

            {/* Active call timer */}
            {callType === "active" && (
              <div className="bg-white p-3 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-lg font-mono font-semibold">
                    {formatDuration(callDuration)}
                  </span>
                </div>
                {callData?.pricePerMinute && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Rate: {callData.currencySymbol}
                    {callData.pricePerMinute}/minute
                  </p>
                )}
              </div>
            )}

            {/* Warning for incoming calls */}
            {callType === "incoming" && (
              <p className="text-xs text-gray-500">
                Audio calls are recorded for quality assurance
              </p>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex justify-center space-x-4">
            {callType === "incoming" && (
              <>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleReject}
                  className="rounded-full w-16 h-16"
                  data-testid="reject-call-btn"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>

                <Button
                  variant="default"
                  size="lg"
                  onClick={handleAccept}
                  disabled={isConnecting}
                  className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
                  data-testid="accept-call-btn"
                >
                  <Phone className="h-6 w-6" />
                </Button>
              </>
            )}

            {callType === "outgoing" && (
              <Button
                variant="destructive"
                size="lg"
                onClick={handleHangup}
                className="rounded-full w-16 h-16"
                data-testid="cancel-call-btn"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            )}

            {callType === "active" && (
              <>
                {/* Mic Toggle */}
                <Button
                  variant={isMuted ? "destructive" : "secondary"}
                  size="lg"
                  onClick={onToggleMic}
                  className="rounded-full w-14 h-14"
                  data-testid="toggle-mic-btn"
                >
                  {isMuted ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>

                {/* Volume Toggle */}
                <Button
                  variant={isVolumeOff ? "destructive" : "secondary"}
                  size="lg"
                  onClick={onToggleVolume}
                  className="rounded-full w-14 h-14"
                  data-testid="toggle-volume-btn"
                >
                  {isVolumeOff ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>

                {/* Hang Up */}
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleHangup}
                  className="rounded-full w-14 h-14"
                  data-testid="hangup-btn"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AudioCallModal;
