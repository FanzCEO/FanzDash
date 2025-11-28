import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Copy,
  Star,
  Tag,
  MessageSquare,
  Zap,
  Filter,
  Hash,
  Keyboard,
  Globe,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CannedResponse {
  id: string;
  title: string;
  content: string;
  shortcut?: string;
  categoryId: string;
  categoryName: string;
  departmentId: string;
  departmentName: string;
  authorId: string;
  authorName: string;
  isPublic: boolean;
  usageCount: number;
  tags: string[];
  language: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Department {
  id: string;
  name: string;
}

interface CannedResponsesProps {
  responses: CannedResponse[];
  categories: Category[];
  departments: Department[];
  onCreateResponse: (data: {
    title: string;
    content: string;
    shortcut?: string;
    categoryId: string;
    departmentId: string;
    isPublic: boolean;
    tags: string[];
    language: string;
  }) => Promise<void>;
  onUpdateResponse: (
    id: string,
    data: Partial<CannedResponse>,
  ) => Promise<void>;
  onDeleteResponse: (id: string) => Promise<void>;
  onUseResponse: (id: string) => void;
  currentUser: {
    id: string;
    name: string;
    role: string;
    departmentId: string;
  };
  className?: string;
}

export function CannedResponses({
  responses,
  categories,
  departments,
  onCreateResponse,
  onUpdateResponse,
  onDeleteResponse,
  onUseResponse,
  currentUser,
  className = "",
}: CannedResponsesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(
    null,
  );

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    shortcut: "",
    categoryId: "",
    departmentId: currentUser.departmentId,
    isPublic: true,
    tags: [] as string[],
    language: "en",
  });
  const [tagInput, setTagInput] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredResponses = responses.filter((response) => {
    const matchesSearch =
      response.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.shortcut?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      response.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || response.categoryId === selectedCategory;
    const matchesDepartment =
      selectedDepartment === "all" ||
      response.departmentId === selectedDepartment;
    const matchesLanguage =
      selectedLanguage === "all" || response.language === selectedLanguage;

    // Role-based filtering
    const canView =
      currentUser.role === "admin" ||
      currentUser.role === "supervisor" ||
      response.isPublic ||
      response.authorId === currentUser.id ||
      response.departmentId === currentUser.departmentId;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDepartment &&
      matchesLanguage &&
      canView
    );
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      shortcut: "",
      categoryId: "",
      departmentId: currentUser.departmentId,
      isPublic: true,
      tags: [],
      language: "en",
    });
    setTagInput("");
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.content.trim()) errors.content = "Content is required";
    if (!formData.categoryId) errors.categoryId = "Category is required";
    if (!formData.departmentId) errors.departmentId = "Department is required";
    if (
      formData.shortcut &&
      (formData.shortcut.length < 2 || formData.shortcut.length > 10)
    ) {
      errors.shortcut = "Shortcut must be 2-10 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingResponse) {
        await onUpdateResponse(editingResponse.id, formData);
      } else {
        await onCreateResponse(formData);
      }
      setIsCreateDialogOpen(false);
      setEditingResponse(null);
      resetForm();
    } catch (error: any) {
      setFormErrors({ submit: error.message || "Failed to save response" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (response: CannedResponse) => {
    setEditingResponse(response);
    setFormData({
      title: response.title,
      content: response.content,
      shortcut: response.shortcut || "",
      categoryId: response.categoryId,
      departmentId: response.departmentId,
      isPublic: response.isPublic,
      tags: response.tags,
      language: response.language,
    });
    setIsCreateDialogOpen(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const ResponseCard = ({ response }: { response: CannedResponse }) => (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  style={{
                    color: categories.find((c) => c.id === response.categoryId)
                      ?.color,
                  }}
                >
                  {response.categoryName}
                </Badge>
                {response.shortcut && (
                  <Badge variant="secondary" className="font-mono">
                    <Hash className="h-3 w-3 mr-1" />
                    {response.shortcut}
                  </Badge>
                )}
                {!response.isPublic && (
                  <Badge variant="outline">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
                {!response.isActive && (
                  <Badge variant="destructive">Inactive</Badge>
                )}
              </div>

              <h3 className="font-bold text-lg line-clamp-2">
                {response.title}
              </h3>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm line-clamp-3 whitespace-pre-wrap">
                  {response.content}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onUseResponse(response.id)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Use Response
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => copyToClipboard(response.content)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Content
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(currentUser.id === response.authorId ||
                  currentUser.role === "admin") && (
                  <>
                    <DropdownMenuItem onClick={() => handleEdit(response)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteResponse(response.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tags */}
          {response.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {response.tags.slice(0, 4).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {response.tags.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{response.tags.length - 4} more
                </Badge>
              )}
            </div>
          )}

          {/* Stats & Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{response.departmentName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>{response.usageCount} uses</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>{response.language.toUpperCase()}</span>
              </div>
            </div>

            <div className="text-right">
              <div>By {response.authorName}</div>
              <div>
                {formatDistanceToNow(new Date(response.updatedAt), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <Zap className="h-8 w-8 text-primary" />
            <span>Canned Responses</span>
          </h1>
          <p className="text-muted-foreground">
            Manage quick response templates for common support inquiries
          </p>
        </div>

        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setEditingResponse(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              {editingResponse ? "Edit Response" : "New Response"}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingResponse
                  ? "Edit Canned Response"
                  : "Create New Canned Response"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {formErrors.submit && (
                <Alert variant="destructive">
                  <AlertDescription>{formErrors.submit}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Response title"
                    className={formErrors.title ? "border-red-500" : ""}
                    data-testid="response-title-input"
                  />
                  {formErrors.title && (
                    <p className="text-sm text-red-600">{formErrors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortcut">Keyboard Shortcut</Label>
                  <Input
                    id="shortcut"
                    value={formData.shortcut}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        shortcut: e.target.value,
                      }))
                    }
                    placeholder="e.g., hello, thanks"
                    className={formErrors.shortcut ? "border-red-500" : ""}
                    data-testid="response-shortcut-input"
                  />
                  {formErrors.shortcut && (
                    <p className="text-sm text-red-600">
                      {formErrors.shortcut}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Response Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Enter your response template..."
                  rows={6}
                  className={formErrors.content ? "border-red-500" : ""}
                  data-testid="response-content-input"
                />
                {formErrors.content && (
                  <p className="text-sm text-red-600">{formErrors.content}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, categoryId: value }))
                    }
                  >
                    <SelectTrigger
                      className={formErrors.categoryId ? "border-red-500" : ""}
                      data-testid="response-category-select"
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.categoryId && (
                    <p className="text-sm text-red-600">
                      {formErrors.categoryId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, departmentId: value }))
                    }
                  >
                    <SelectTrigger
                      className={
                        formErrors.departmentId ? "border-red-500" : ""
                      }
                      data-testid="response-department-select"
                    >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.departmentId && (
                    <p className="text-sm text-red-600">
                      {formErrors.departmentId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger data-testid="response-language-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Tags</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    data-testid="tag-input"
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center space-x-1"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isPublic: checked }))
                  }
                  data-testid="response-public-toggle"
                />
                <Label
                  htmlFor="isPublic"
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Make this response available to all agents</span>
                </Label>
              </div>

              <div className="flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-purple-600"
                  data-testid="save-response-btn"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingResponse
                      ? "Update Response"
                      : "Create Response"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {responses.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Responses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {responses.filter((r) => r.isPublic).length}
            </div>
            <div className="text-sm text-muted-foreground">Public</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {responses.reduce((sum, r) => sum + r.usageCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Uses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {responses.filter((r) => r.authorId === currentUser.id).length}
            </div>
            <div className="text-sm text-muted-foreground">My Responses</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search responses, shortcuts, content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="responses-search-input"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responses Grid */}
      {filteredResponses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResponses.map((response) => (
            <ResponseCard key={response.id} response={response} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Responses Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "No responses match your search criteria."
                : "Get started by creating your first canned response template."}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-primary to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Response
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CannedResponses;
