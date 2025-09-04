import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Loader2, Image as ImageIcon } from "lucide-react";
// Debounce utility function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

interface GifItem {
  id: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    fixed_width: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
      width: string;
      height: string;
    };
  };
}

interface GifPickerProps {
  onSelectGif: (gifUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function GifPicker({
  onSelectGif,
  isOpen,
  onClose,
  className = "",
}: GifPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock GIF data for demonstration
  const mockGifs: GifItem[] = [
    {
      id: "1",
      title: "Happy Dance",
      images: {
        fixed_height: {
          url: "/api/placeholder/200/150",
          width: "200",
          height: "150",
        },
        fixed_width: {
          url: "/api/placeholder/200/150",
          width: "200",
          height: "150",
        },
        original: {
          url: "/api/placeholder/400/300",
          width: "400",
          height: "300",
        },
      },
    },
    {
      id: "2",
      title: "Thumbs Up",
      images: {
        fixed_height: {
          url: "/api/placeholder/200/150",
          width: "200",
          height: "150",
        },
        fixed_width: {
          url: "/api/placeholder/200/150",
          width: "200",
          height: "150",
        },
        original: {
          url: "/api/placeholder/400/300",
          width: "400",
          height: "300",
        },
      },
    },
    {
      id: "3",
      title: "Celebration",
      images: {
        fixed_height: {
          url: "/api/placeholder/200/150",
          width: "200",
          height: "150",
        },
        fixed_width: {
          url: "/api/placeholder/200/150",
          width: "200",
          height: "150",
        },
        original: {
          url: "/api/placeholder/400/300",
          width: "400",
          height: "300",
        },
      },
    },
    {
      id: "4",
      title: "Love Heart",
      images: {
        fixed_height: {
          url: "/api/placeholder/200/150",
          width: "200",
          height: "150",
        },
        fixed_width: {
          url: "/api/placeholder/200/150",
          width: "200",
          height: "150",
        },
        original: {
          url: "/api/placeholder/400/300",
          width: "400",
          height: "300",
        },
      },
    },
    {
      id: "5",
      title: "Funny Cat",
      images: {
        fixed_height: {
          url: "/api/placeholder/200/150",
          width: "200",
          height: "150",
        },
        fixed_width: {
          url: "/api/placeholder/200/150",
          width: "200",
          height: "150",
        },
        original: {
          url: "/api/placeholder/400/300",
          width: "400",
          height: "300",
        },
      },
    },
    {
      id: "6",
      title: "Wow Reaction",
      images: {
        fixed_height: {
          url: "/api/placeholder/200/150",
          width: "200",
          height: "150",
        },
        fixed_width: {
          url: "/api/placeholder/200/150",
          width: "200",
          height: "150",
        },
        original: {
          url: "/api/placeholder/400/300",
          width: "400",
          height: "300",
        },
      },
    },
  ];

  const searchGifs = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setGifs(mockGifs);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Filter mock data based on search query
        const filteredGifs = mockGifs.filter((gif) =>
          gif.title.toLowerCase().includes(query.toLowerCase()),
        );

        setGifs(filteredGifs);
      } catch (err) {
        setError("Failed to search GIFs. Please try again.");
        console.error("GIF search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [mockGifs],
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchGifs(query);
  };

  const handleSelectGif = (gif: GifItem) => {
    onSelectGif(gif.images.fixed_height.url);
    onClose();
  };

  // Load trending GIFs on mount
  useState(() => {
    setGifs(mockGifs);
  });

  if (!isOpen) return null;

  return (
    <Card
      className={`absolute z-50 w-80 max-h-96 overflow-hidden ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Choose a GIF</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </CardTitle>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for GIFs..."
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {error && (
          <Alert variant="destructive" className="m-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Searching GIFs...</span>
          </div>
        ) : gifs.length > 0 ? (
          <div
            className="grid grid-cols-2 gap-2 p-3 max-h-64 overflow-y-auto custom-scrollbar"
            style={{ maxHeight: "16rem" }}
          >
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => handleSelectGif(gif)}
                className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity group relative"
              >
                <img
                  src={gif.images.fixed_height.url}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
            <p>No GIFs found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GifPicker;
