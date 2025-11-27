import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Calendar,
  Tag,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface FilterOption {
  key: string;
  label: string;
  type: "text" | "select" | "multiselect" | "date" | "status" | "boolean";
  options?: string[];
  placeholder?: string;
}

interface NewAdvancedFiltersProps {
  category: string;
  onFiltersChange: (filters: Record<string, any>) => void;
  onSearch: (searchTerm: string, keywords: string[]) => void;
}

// Dynamic filter options based on category
const getFilterOptionsForCategory = (category: string): FilterOption[] => {
  const baseOptions = [
    {
      key: "dateRange",
      label: "Date Range",
      type: "select" as const,
      options: [
        "Last 24 hours",
        "Last 7 days",
        "Last 30 days",
        "Last 90 days",
        "Custom range",
      ],
    },
    {
      key: "priority",
      label: "Priority",
      type: "select" as const,
      options: ["Critical", "High", "Medium", "Low"],
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      type: "multiselect" as const,
      options: [
        "Moderator 1",
        "Moderator 2",
        "Compliance Officer",
        "Super Admin",
      ],
    },
  ];

  switch (category.toLowerCase()) {
    case "media-content":
      return [
        ...baseOptions,
        {
          key: "contentType",
          label: "Content Type",
          type: "multiselect" as const,
          options: ["Image", "Video", "Text", "Live Stream", "Audio"],
        },
        {
          key: "moderationStatus",
          label: "Moderation Status",
          type: "multiselect" as const,
          options: [
            "Pending",
            "Approved",
            "Rejected",
            "Requires Review",
            "Escalated",
          ],
        },
        {
          key: "complianceRisk",
          label: "Compliance Risk",
          type: "multiselect" as const,
          options: ["Low", "Medium", "High", "Critical"],
        },
        {
          key: "aiConfidence",
          label: "AI Confidence",
          type: "select" as const,
          options: ["90-100%", "70-89%", "50-69%", "Below 50%"],
        },
        { key: "hasCoStars", label: "Has Co-Stars", type: "boolean" as const },
        {
          key: "verified2257",
          label: "2257 Verified",
          type: "boolean" as const,
        },
        { key: "flagged", label: "Flagged Content", type: "boolean" as const },
      ];

    case "compliance-legal":
      return [
        ...baseOptions,
        {
          key: "complianceType",
          label: "Compliance Type",
          type: "multiselect" as const,
          options: ["2257", "GDPR", "CCPA", "DMCA", "COPPA"],
        },
        {
          key: "auditStatus",
          label: "Audit Status",
          type: "multiselect" as const,
          options: [
            "Compliant",
            "Non-Compliant",
            "Under Review",
            "Action Required",
          ],
        },
        {
          key: "riskLevel",
          label: "Risk Level",
          type: "multiselect" as const,
          options: ["Low", "Medium", "High", "Critical"],
        },
        {
          key: "escalationLevel",
          label: "Escalation Level",
          type: "multiselect" as const,
          options: ["Normal", "Manager Review", "Legal Team", "Emergency"],
        },
        {
          key: "documentType",
          label: "Document Type",
          type: "multiselect" as const,
          options: [
            "ID Verification",
            "Model Release",
            "Age Verification",
            "Consent Form",
          ],
        },
      ];

    case "database-storage":
      return [
        ...baseOptions,
        {
          key: "dataType",
          label: "Data Type",
          type: "multiselect" as const,
          options: [
            "User Data",
            "Content Files",
            "Audit Logs",
            "Backup Files",
            "Temp Files",
          ],
        },
        {
          key: "storageLocation",
          label: "Storage Location",
          type: "multiselect" as const,
          options: ["Local", "AWS S3", "Google Cloud", "CDN", "Backup"],
        },
        {
          key: "retentionStatus",
          label: "Retention Status",
          type: "multiselect" as const,
          options: ["Active", "Archived", "Scheduled Deletion", "Legal Hold"],
        },
        {
          key: "sizeRange",
          label: "Size Range",
          type: "select" as const,
          options: ["< 1MB", "1-10MB", "10-100MB", "100MB-1GB", "> 1GB"],
        },
        { key: "encrypted", label: "Encrypted", type: "boolean" as const },
      ];

    case "platform-connections":
      return [
        ...baseOptions,
        {
          key: "platformType",
          label: "Platform Type",
          type: "multiselect" as const,
          options: [
            "FanzLab",
            "BoyFanz",
            "GirlFanz",
            "DaddyFanz",
            "PupFanz",
            "TabooFanz",
            "TransFanz",
            "CougarFanz",
            "FanzClips",
            "FanzTube",
          ],
        },
        {
          key: "connectionStatus",
          label: "Connection Status",
          type: "multiselect" as const,
          options: ["Online", "Offline", "Maintenance", "Error"],
        },
        {
          key: "apiStatus",
          label: "API Status",
          type: "multiselect" as const,
          options: ["Active", "Inactive", "Rate Limited", "Error"],
        },
        {
          key: "healthScore",
          label: "Health Score",
          type: "select" as const,
          options: ["90-100%", "70-89%", "50-69%", "Below 50%"],
        },
        {
          key: "uptime",
          label: "Uptime",
          type: "select" as const,
          options: ["99.9%+", "99.0-99.8%", "95.0-98.9%", "Below 95%"],
        },
      ];

    case "ai-intelligence":
      return [
        ...baseOptions,
        {
          key: "modelType",
          label: "AI Model",
          type: "multiselect" as const,
          options: ["ChatGPT-5", "GPT-4o Vision", "Whisper", "CLIP", "NudeNet"],
        },
        {
          key: "analysisType",
          label: "Analysis Type",
          type: "multiselect" as const,
          options: [
            "Content Moderation",
            "Threat Detection",
            "Risk Assessment",
            "Compliance Check",
          ],
        },
        {
          key: "confidenceLevel",
          label: "Confidence Level",
          type: "select" as const,
          options: ["95-100%", "80-94%", "60-79%", "Below 60%"],
        },
        {
          key: "processingStatus",
          label: "Processing Status",
          type: "multiselect" as const,
          options: ["Completed", "Processing", "Failed", "Queued"],
        },
        { key: "hasAlerts", label: "Has Alerts", type: "boolean" as const },
      ];

    case "user-financial":
      return [
        ...baseOptions,
        {
          key: "userType",
          label: "User Type",
          type: "multiselect" as const,
          options: ["Creator", "Subscriber", "Moderator", "Admin"],
        },
        {
          key: "accountStatus",
          label: "Account Status",
          type: "multiselect" as const,
          options: [
            "Active",
            "Suspended",
            "Pending Verification",
            "Terminated",
          ],
        },
        {
          key: "paymentStatus",
          label: "Payment Status",
          type: "multiselect" as const,
          options: ["Completed", "Pending", "Failed", "Refunded", "Disputed"],
        },
        {
          key: "transactionType",
          label: "Transaction Type",
          type: "multiselect" as const,
          options: ["Subscription", "Tip", "Purchase", "Withdrawal", "Refund"],
        },
        {
          key: "amountRange",
          label: "Amount Range",
          type: "select" as const,
          options: ["$0-$10", "$10-$50", "$50-$100", "$100-$500", "$500+"],
        },
        {
          key: "verificationStatus",
          label: "Verification Status",
          type: "multiselect" as const,
          options: ["Verified", "Pending", "Rejected", "Expired"],
        },
      ];

    case "system-admin":
      return [
        ...baseOptions,
        {
          key: "systemType",
          label: "System Type",
          type: "multiselect" as const,
          options: ["Server", "Database", "CDN", "Load Balancer", "Cache"],
        },
        {
          key: "systemStatus",
          label: "System Status",
          type: "multiselect" as const,
          options: ["Operational", "Degraded", "Maintenance", "Down"],
        },
        {
          key: "alertLevel",
          label: "Alert Level",
          type: "multiselect" as const,
          options: ["Info", "Warning", "Error", "Critical"],
        },
        {
          key: "performance",
          label: "Performance",
          type: "select" as const,
          options: [
            "Excellent (90-100%)",
            "Good (70-89%)",
            "Fair (50-69%)",
            "Poor (<50%)",
          ],
        },
        {
          key: "hasIncidents",
          label: "Has Incidents",
          type: "boolean" as const,
        },
      ];

    default:
      return baseOptions;
  }
};

export function NewAdvancedFilters({
  category,
  onFiltersChange,
  onSearch,
}: NewAdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [quickFilters, setQuickFilters] = useState<string[]>([]);

  const filterOptions = getFilterOptionsForCategory(category);

  const handleKeywordAdd = (keyword: string) => {
    if (keyword.trim() && !keywords.includes(keyword.trim())) {
      const newKeywords = [...keywords, keyword.trim()];
      setKeywords(newKeywords);
      setKeywordInput("");
      onSearch(searchTerm, newKeywords);
    }
  };

  const handleKeywordRemove = (keyword: string) => {
    const newKeywords = keywords.filter((k) => k !== keyword);
    setKeywords(newKeywords);
    onSearch(searchTerm, newKeywords);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleQuickFilter = (filter: string) => {
    if (quickFilters.includes(filter)) {
      setQuickFilters(quickFilters.filter((f) => f !== filter));
    } else {
      setQuickFilters([...quickFilters, filter]);
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setKeywords([]);
    setSearchTerm("");
    setKeywordInput("");
    setQuickFilters([]);
    onFiltersChange({});
    onSearch("", []);
  };

  const getQuickFiltersForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case "media-content":
        return [
          "Pending Review",
          "High Risk",
          "Missing 2257",
          "Co-Star Issues",
          "AI Flagged",
        ];
      case "compliance-legal":
        return [
          "Non-Compliant",
          "Action Required",
          "Legal Review",
          "Expired Docs",
          "High Risk",
        ];
      case "database-storage":
        return [
          "Large Files",
          "Legal Hold",
          "Unencrypted",
          "Expiring Soon",
          "Error Status",
        ];
      case "platform-connections":
        return [
          "Offline",
          "API Errors",
          "Low Health",
          "Rate Limited",
          "Maintenance",
        ];
      case "ai-intelligence":
        return [
          "High Confidence",
          "Processing Failed",
          "Alerts Active",
          "Manual Review",
          "Model Errors",
        ];
      case "user-financial":
        return [
          "Payment Failed",
          "High Value",
          "Verification Pending",
          "Suspicious Activity",
          "Disputed",
        ];
      case "system-admin":
        return [
          "Critical Alerts",
          "Performance Issues",
          "System Down",
          "Security Events",
          "Maintenance Due",
        ];
      default:
        return [
          "High Priority",
          "Action Required",
          "Error Status",
          "Recently Updated",
        ];
    }
  };

  const quickFilterOptions = getQuickFiltersForCategory(category);

  return (
    <Card className="bg-black/40 border-primary/20 cyber-border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <div>
              <CardTitle className="text-cyan-400 text-lg">
                Advanced Filters
              </CardTitle>
              <CardDescription className="text-gray-400">
                {category.replace(/-/g, "/").toUpperCase()} • Multiple keyword
                search & drill-down options
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="toggle-filters"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search ${category.replace(/-/g, " ")} content...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onSearch(e.target.value, keywords);
              }}
              className="pl-10 bg-black/50 border-primary/20"
              data-testid="search-input"
            />
          </div>

          {/* Keyword Tags */}
          <div className="space-y-2">
            <div className="relative">
              <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Add keywords (press Enter to add)"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleKeywordAdd(keywordInput);
                  }
                }}
                className="pl-10 bg-black/50 border-primary/20"
                data-testid="keyword-input"
              />
              <Button
                size="sm"
                onClick={() => handleKeywordAdd(keywordInput)}
                className="absolute right-2 top-2 h-6 px-2"
                data-testid="add-keyword"
              >
                Add
              </Button>
            </div>

            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="outline"
                    className="text-cyan-400 border-cyan-400"
                    data-testid={`keyword-${keyword}`}
                  >
                    {keyword}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => handleKeywordRemove(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-2">
          <Label className="text-white font-semibold">Quick Filters</Label>
          <div className="flex flex-wrap gap-2">
            {quickFilterOptions.map((filter) => (
              <Button
                key={filter}
                variant={quickFilters.includes(filter) ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter(filter)}
                className={
                  quickFilters.includes(filter)
                    ? "bg-cyan-600 hover:bg-cyan-700"
                    : "border-primary/20 hover:border-cyan-400"
                }
                data-testid={`quick-filter-${filter.replace(/\s+/g, "-").toLowerCase()}`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Filter Options */}
        {isExpanded && (
          <div className="space-y-4 border-t border-primary/20 pt-4">
            <Label className="text-white font-semibold">Advanced Options</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterOptions.map((option) => (
                <div key={option.key} className="space-y-2">
                  <Label className="text-gray-300">{option.label}</Label>

                  {option.type === "text" && (
                    <Input
                      placeholder={
                        option.placeholder ||
                        `Enter ${option.label.toLowerCase()}`
                      }
                      value={activeFilters[option.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(option.key, e.target.value)
                      }
                      className="bg-black/50 border-primary/20"
                      data-testid={`filter-${option.key}`}
                    />
                  )}

                  {option.type === "select" && option.options && (
                    <Select
                      value={activeFilters[option.key] || ""}
                      onValueChange={(value) =>
                        handleFilterChange(option.key, value)
                      }
                    >
                      <SelectTrigger
                        className="bg-black/50 border-primary/20"
                        data-testid={`filter-${option.key}`}
                      >
                        <SelectValue
                          placeholder={`Select ${option.label.toLowerCase()}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {option.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {option.type === "multiselect" && option.options && (
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-primary/20 rounded p-2 bg-black/50">
                      {option.options.map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${option.key}-${opt}`}
                            checked={(activeFilters[option.key] || []).includes(
                              opt,
                            )}
                            onCheckedChange={(checked) => {
                              const current = activeFilters[option.key] || [];
                              const updated = checked
                                ? [...current, opt]
                                : current.filter(
                                    (item: string) => item !== opt,
                                  );
                              handleFilterChange(option.key, updated);
                            }}
                            data-testid={`filter-${option.key}-${opt.replace(/\s+/g, "-").toLowerCase()}`}
                          />
                          <Label
                            htmlFor={`${option.key}-${opt}`}
                            className="text-sm text-gray-300"
                          >
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {option.type === "boolean" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={option.key}
                        checked={activeFilters[option.key] || false}
                        onCheckedChange={(checked) =>
                          handleFilterChange(option.key, checked)
                        }
                        data-testid={`filter-${option.key}`}
                      />
                      <Label
                        htmlFor={option.key}
                        className="text-sm text-gray-300"
                      >
                        Yes
                      </Label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Summary & Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-primary/20">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {Object.keys(activeFilters).filter(
                (key) =>
                  activeFilters[key] &&
                  (Array.isArray(activeFilters[key])
                    ? activeFilters[key].length > 0
                    : true),
              ).length +
                keywords.length +
                quickFilters.length}{" "}
              filters active
            </span>
            {(Object.keys(activeFilters).length > 0 ||
              keywords.length > 0 ||
              quickFilters.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-400 hover:text-red-300"
                data-testid="clear-filters"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
