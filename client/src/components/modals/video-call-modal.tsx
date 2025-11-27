import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Camera,
  CameraOff,
  Clock,
  DollarSign,
  Monitor,
} from "lucide-react";

interface VideoCallModalProps {
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
  onToggleVideo?: () => void;
  onToggleVolume?: () => void;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isVolumeOff?: boolean;
  localVideoStream?: MediaStream;
  remoteVideoStream?: MediaStream;
  className?: string;
}

export function VideoCallModal({
  isOpen,
  onClose,
  callType,
  caller,
  callData,
  onAccept,
  onReject,
  onHangup,
  onToggleMic,
  onToggleVideo,
  onToggleVolume,
  isMuted = false,
  isVideoOff = false,
  isVolumeOff = false,
  localVideoStream,
  remoteVideoStream,
  className = "",
}: VideoCallModalProps) {
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
      <DialogContent className="sm:max-w-lg bg-gradient-to-b from-slate-900 to-black text-white border-slate-700">
        <div className="space-y-4 p-4">
          {/* Video Areas */}
          {callType === "active" && (
            <div className="relative">
              {/* Remote Video (main) */}
              <div className="relative w-full aspect-video bg-slate-800 rounded-lg overflow-hidden">
                {remoteVideoStream ? (
                  <video
                    ref={(video) => {
                      if (video && remoteVideoStream) {
                        video.srcObject = remoteVideoStream;
                        video.play();
                      }
                    }}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted={isVolumeOff}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    {isVideoOff ? (
                      <div className="text-center">
                        <CameraOff className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                        <p className="text-slate-400">Video is off</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Avatar className="h-20 w-20 mx-auto mb-2 border-2 border-slate-600">
                          <AvatarImage src={caller.avatar} />
                          <AvatarFallback className="bg-slate-700 text-white text-2xl">
                            {caller.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-slate-300">{caller.name}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Local Video (picture-in-picture) */}
                <div className="absolute top-4 right-4 w-24 h-18 bg-slate-700 rounded-lg overflow-hidden border border-slate-600">
                  {localVideoStream && !isVideoOff ? (
                    <video
                      ref={(video) => {
                        if (video && localVideoStream) {
                          video.srcObject = localVideoStream;
                          video.play();
                        }
                      }}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <CameraOff className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* Call status overlay */}
                <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
                  <div className="flex items-center space-x-2 text-white">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-mono">
                      {formatDuration(callDuration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Non-active call UI */}
          {callType !== "active" && (
            <div className="text-center space-y-6">
              {/* Profile Image */}
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 border-4 border-white/20 shadow-lg">
                  <AvatarImage src={caller.avatar} />
                  <AvatarFallback className="text-3xl bg-slate-700 text-white">
                    {caller.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Call indicator */}
                {callType === "incoming" && (
                  <div className="absolute -bottom-2 -right-2">
                    <Badge
                      variant="default"
                      className="bg-blue-500 animate-pulse"
                    >
                      <Video className="w-3 h-3 mr-1" />
                      VIDEO
                    </Badge>
                  </div>
                )}
              </div>

              {/* Caller Info */}
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">
                  {callType === "incoming"
                    ? "Incoming Video Call"
                    : caller.name}
                </h3>
                <p className="text-slate-300">{getCallStatus()}</p>

                {/* Pricing info for incoming calls */}
                {callData && callType === "incoming" && (
                  <div className="bg-white/10 p-3 rounded-lg inline-block">
                    <div className="flex items-center justify-center space-x-1 text-green-400">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">
                        {callData.currencySymbol}
                        {callData.totalAmount?.toFixed(2)}
                      </span>
                    </div>
                    {callData.pricePerMinute && (
                      <p className="text-xs text-slate-400 mt-1">
                        {callData.currencySymbol}
                        {callData.pricePerMinute}/minute
                      </p>
                    )}
                  </div>
                )}

                {/* Warning notice */}
                {callType === "incoming" && (
                  <p className="text-xs text-slate-400">
                    Video calls are recorded for quality and safety
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Call Controls */}
          <div className="flex justify-center space-x-3">
            {callType === "incoming" && (
              <>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleReject}
                  className="rounded-full w-16 h-16"
                  data-testid="reject-video-call-btn"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>

                <Button
                  variant="default"
                  size="lg"
                  onClick={handleAccept}
                  disabled={isConnecting}
                  className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
                  data-testid="accept-video-call-btn"
                >
                  <Video className="h-6 w-6" />
                </Button>
              </>
            )}

            {callType === "outgoing" && (
              <Button
                variant="destructive"
                size="lg"
                onClick={handleHangup}
                className="rounded-full w-16 h-16"
                data-testid="cancel-video-call-btn"
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
                  className="rounded-full w-12 h-12"
                  data-testid="toggle-video-mic-btn"
                >
                  {isMuted ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>

                {/* Video Toggle */}
                <Button
                  variant={isVideoOff ? "destructive" : "secondary"}
                  size="lg"
                  onClick={onToggleVideo}
                  className="rounded-full w-12 h-12"
                  data-testid="toggle-video-camera-btn"
                >
                  {isVideoOff ? (
                    <CameraOff className="h-5 w-5" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                </Button>

                {/* Volume Toggle */}
                <Button
                  variant={isVolumeOff ? "destructive" : "secondary"}
                  size="lg"
                  onClick={onToggleVolume}
                  className="rounded-full w-12 h-12"
                  data-testid="toggle-video-volume-btn"
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
                  className="rounded-full w-12 h-12"
                  data-testid="hangup-video-btn"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {/* Active call info */}
          {callType === "active" && callData && (
            <div className="text-center bg-black/30 p-3 rounded-lg">
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">
                    {formatDuration(callDuration)}
                  </span>
                </div>
                {callData.pricePerMinute && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {callData.currencySymbol}
                      {callData.pricePerMinute}/min
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VideoCallModal;
