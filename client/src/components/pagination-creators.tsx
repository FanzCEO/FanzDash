import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface PaginationCreatorsProps {
  hasMorePages: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  filters?: {
    query?: string;
    gender?: string;
    minAge?: number;
    maxAge?: number;
  };
  className?: string;
}

export function PaginationCreators({
  hasMorePages,
  isLoading,
  onLoadMore,
  filters,
  className = "",
}: PaginationCreatorsProps) {
  if (!hasMorePages) {
    return null;
  }

  return (
    <div className={`text-center ${className}`}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoading}
        className="px-6 py-2"
        data-testid="load-more-creators"
      >
        {isLoading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          "Load More Creators"
        )}
      </Button>
    </div>
  );
}

export default PaginationCreators;
