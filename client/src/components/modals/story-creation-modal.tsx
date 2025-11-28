import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Image as ImageIcon, Type, Clock, X, Camera, Edit } from "lucide-react";

interface StoryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    storyImage: boolean;
    storyText: boolean;
  };
  onNavigate: (type: "image" | "text") => void;
  className?: string;
}

export function StoryCreationModal({
  isOpen,
  onClose,
  settings,
  onNavigate,
  className = "",
}: StoryCreationModalProps) {
  const handleChoiceSelect = (type: "image" | "text") => {
    onNavigate(type);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Choose Story Type</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
              data-testid="close-story-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Image Story Option */}
          {settings.storyImage && (
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleChoiceSelect("image")}
              data-testid="story-image-option"
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h6 className="font-semibold mb-1">Image Story</h6>
                    <p className="text-sm text-muted-foreground">
                      Share a photo with your story
                    </p>
                  </div>
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Text Story Option */}
          {settings.storyText && (
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleChoiceSelect("text")}
              data-testid="story-text-option"
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                    <Edit className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h6 className="font-semibold mb-1">Text Story</h6>
                    <p className="text-sm text-muted-foreground">
                      Write a text-only story
                    </p>
                  </div>
                  <Type className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* No options available */}
          {!settings.storyImage && !settings.storyText && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Story creation is currently disabled
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StoryCreationModal;
