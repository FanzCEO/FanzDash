import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Sticker {
  id: string;
  url: string;
  name?: string;
  category?: string;
}

interface StickerPickerProps {
  stickers: Sticker[];
  onStickerSelect: (sticker: Sticker) => void;
  className?: string;
  maxHeight?: number;
}

export function StickerPicker({
  stickers,
  onStickerSelect,
  className = "",
  maxHeight = 200,
}: StickerPickerProps) {
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);

  const handleStickerClick = (sticker: Sticker) => {
    setSelectedSticker(sticker.id);
    onStickerSelect(sticker);

    // Reset selection after animation
    setTimeout(() => setSelectedSticker(null), 200);
  };

  if (!stickers.length) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-muted-foreground">No stickers available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ScrollArea style={{ maxHeight: `${maxHeight}px` }}>
        <div className="grid grid-cols-4 gap-2 p-2">
          {stickers.map((sticker) => (
            <Button
              key={sticker.id}
              variant="ghost"
              className={cn(
                "p-2 h-auto aspect-square relative transition-all duration-150",
                selectedSticker === sticker.id
                  ? "bg-primary/20 scale-95 ring-2 ring-primary"
                  : "hover:bg-muted/50",
              )}
              onClick={() => handleStickerClick(sticker)}
              data-testid={`sticker-${sticker.id}`}
            >
              <img
                src={sticker.url}
                alt={sticker.name || `Sticker ${sticker.id}`}
                className="w-full h-full object-contain rounded"
                loading="lazy"
              />
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default StickerPicker;
