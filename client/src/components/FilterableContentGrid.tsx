import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewAdvancedFilters } from "./NewAdvancedFilters";
import {
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Tag,
  Filter,
} from "lucide-react";

interface FilterableItem {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  creator?: string;
  assignedTo?: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface FilterableContentGridProps {
  category: string;
  items: FilterableItem[];
  onItemSelect?: (item: FilterableItem) => void;
  onItemAction?: (action: string, item: FilterableItem) => void;
}

export function FilterableContentGrid({
  category,
  items,
  onItemSelect,
  onItemAction,
}: FilterableContentGridProps) {
  const [filteredItems, setFilteredItems] = useState<FilterableItem[]>(items);
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    applyFilters();
  }, [items, currentFilters, searchTerm, keywords, sortBy, sortOrder]);

  const applyFilters = () => {
    let filtered = [...items];

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.creator?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    // Apply keywords
    if (keywords.length > 0) {
      filtered = filtered.filter((item) =>
        keywords.every(
          (keyword) =>
            item.title.toLowerCase().includes(keyword.toLowerCase()) ||
            item.type.toLowerCase().includes(keyword.toLowerCase()) ||
            item.tags.some((tag) =>
              tag.toLowerCase().includes(keyword.toLowerCase()),
            ) ||
            JSON.stringify(item.metadata)
              .toLowerCase()
              .includes(keyword.toLowerCase()),
        ),
      );
    }

    // Apply advanced filters
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return;

      switch (key) {
        case "contentType":
        case "moderationStatus":
        case "complianceRisk":
        case "platformType":
        case "connectionStatus":
        case "userType":
        case "accountStatus":
        case "paymentStatus":
        case "systemType":
        case "systemStatus":
          if (Array.isArray(value)) {
            filtered = filtered.filter((item) =>
              value.some(
                (v) =>
                  item.type.toLowerCase().includes(v.toLowerCase()) ||
                  item.status.toLowerCase().includes(v.toLowerCase()) ||
                  item.metadata[key]?.toLowerCase().includes(v.toLowerCase()),
              ),
            );
          }
          break;

        case "priority":
          if (Array.isArray(value)) {
            filtered = filtered.filter((item) => value.includes(item.priority));
          } else if (value) {
            filtered = filtered.filter((item) => item.priority === value);
          }
          break;

        case "assignedTo":
          if (Array.isArray(value)) {
            filtered = filtered.filter(
              (item) => item.assignedTo && value.includes(item.assignedTo),
            );
          }
          break;

        case "dateRange":
          const now = new Date();
          let cutoffDate = new Date();
          switch (value) {
            case "Last 24 hours":
              cutoffDate.setDate(now.getDate() - 1);
              break;
            case "Last 7 days":
              cutoffDate.setDate(now.getDate() - 7);
              break;
            case "Last 30 days":
              cutoffDate.setDate(now.getDate() - 30);
              break;
            case "Last 90 days":
              cutoffDate.setDate(now.getDate() - 90);
              break;
          }
          if (value !== "Custom range") {
            filtered = filtered.filter(
              (item) => new Date(item.updatedAt) >= cutoffDate,
            );
          }
          break;

        case "hasCoStars":
        case "verified2257":
        case "flagged":
        case "encrypted":
        case "hasAlerts":
        case "hasIncidents":
          if (typeof value === "boolean") {
            filtered = filtered.filter(
              (item) => Boolean(item.metadata[key]) === value,
            );
          }
          break;
      }
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "priority":
          const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
        default:
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredItems(filtered);
  };

  const handleFiltersChange = (filters: Record<string, any>) => {
    setCurrentFilters(filters);
  };

  const handleSearch = (searchTerm: string, keywords: string[]) => {
    setSearchTerm(searchTerm);
    setKeywords(keywords);
  };

  const getStatusIcon = (status: string, priority: string) => {
    const lowerStatus = status.toLowerCase();
    const lowerPriority = priority.toLowerCase();

    if (lowerPriority === "critical" || lowerStatus.includes("critical")) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    if (lowerStatus.includes("approved") || lowerStatus.includes("completed")) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    if (lowerStatus.includes("rejected") || lowerStatus.includes("failed")) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (lowerStatus.includes("pending") || lowerStatus.includes("processing")) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    return <Eye className="w-4 h-4 text-gray-400" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "text-red-400 border-red-400 bg-red-400/10";
      case "high":
        return "text-orange-400 border-orange-400 bg-orange-400/10";
      case "medium":
        return "text-yellow-400 border-yellow-400 bg-yellow-400/10";
      case "low":
        return "text-green-400 border-green-400 bg-green-400/10";
      default:
        return "text-gray-400 border-gray-400 bg-gray-400/10";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Advanced Filters */}
      <NewAdvancedFilters
        category={category}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />

      {/* Sort Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            Showing {filteredItems.length} of {items.length} items
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/50 border border-primary/20 rounded px-2 py-1 text-sm text-white"
            >
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Created</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="text-xs"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="bg-black/40 border-primary/20 cyber-border hover:border-cyan-400/50 transition-colors cursor-pointer"
            onClick={() => onItemSelect?.(item)}
            data-testid={`content-item-${item.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-white text-sm font-medium truncate">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-xs">
                    {item.type} • {formatDate(item.updatedAt)}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(item.status, item.priority)}
                  <Badge
                    variant="outline"
                    className={`text-xs ${getPriorityColor(item.priority)}`}
                  >
                    {item.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Status and Metadata */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Status:</span>
                  <Badge variant="outline" className="text-xs">
                    {item.status}
                  </Badge>
                </div>

                {item.creator && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Creator:</span>
                    <span className="text-cyan-400">{item.creator}</span>
                  </div>
                )}

                {item.assignedTo && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Assigned:</span>
                    <span className="text-white">{item.assignedTo}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs py-0 px-1 text-cyan-400 border-cyan-400/50"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs py-0 px-1 text-gray-400"
                      >
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemAction?.("view", item);
                  }}
                  data-testid={`view-${item.id}`}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemAction?.("edit", item);
                  }}
                  data-testid={`edit-${item.id}`}
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card className="bg-black/40 border-primary/20 cyber-border">
          <CardContent className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No items found
            </h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your filters or search terms to find what you're
              looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentFilters({});
                setSearchTerm("");
                setKeywords([]);
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
