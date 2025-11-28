import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  FolderOpen,
  Plus,
  Edit3,
  Trash2,
  MoreHorizontal,
  Search,
  Grid3X3,
  Package,
  Users,
  TrendingUp,
  RefreshCw,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  productCount: number;
  creatorCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string;
  isActive: boolean;
  order: number;
}

interface CategoriesManagementProps {
  categories: Category[];
  onCreateCategory: (data: Omit<CategoryFormData, "id">) => Promise<void>;
  onUpdateCategory: (
    id: string,
    data: Partial<CategoryFormData>,
  ) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onReorderCategories: (
    categories: { id: string; order: number }[],
  ) => Promise<void>;
  stats: {
    totalCategories: number;
    activeCategories: number;
    totalProducts: number;
    totalCreators: number;
  };
  className?: string;
}

export function CategoriesManagement({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  stats,
  className = "",
}: CategoriesManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    image: "",
    parentId: "",
    isActive: true,
    order: 0,
  });

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      parentId: "",
      isActive: true,
      order: categories.length,
    });
    setErrors({});
  };

  const handleCreateCategory = () => {
    resetForm();
    setEditingCategory(null);
    setIsCreateModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setFormData({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      parentId: category.parentId || "",
      isActive: category.isActive,
      order: category.order,
    });
    setEditingCategory(category);
    setIsCreateModalOpen(true);
  };

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate slug when name changes
    if (field === "name") {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Category slug is required";
    } else if (
      categories.some(
        (cat) => cat.slug === formData.slug && cat.id !== formData.id,
      )
    ) {
      newErrors.slug = "This slug is already in use";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, formData);
      } else {
        await onCreateCategory(formData);
      }
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to save category" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    setIsSubmitting(true);
    try {
      await onDeleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    } catch (error: any) {
      setErrors({ delete: error.message || "Failed to delete category" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CategoryCard = ({ category }: { category: Category }) => (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Category Image */}
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                {category.isActive ? (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setDeletingCategory(category)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Category Info */}
            <p className="text-sm text-muted-foreground mb-1">
              /{category.slug}
            </p>

            {category.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {category.description}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold">{category.productCount}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center">
                  <Package className="h-3 w-3 mr-1" />
                  Products
                </p>
              </div>
              <div>
                <p className="text-lg font-bold">{category.creatorCount}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center">
                  <Users className="h-3 w-3 mr-1" />
                  Creators
                </p>
              </div>
              <div>
                <p className="text-lg font-bold">#{category.order}</p>
                <p className="text-xs text-muted-foreground">Order</p>
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
            <Grid3X3 className="h-8 w-8 text-primary" />
            <span>Categories Management</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize products and creators with categories
          </p>
        </div>

        <Button
          onClick={handleCreateCategory}
          className="bg-gradient-to-r from-primary to-purple-600"
          data-testid="create-category-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Grid3X3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Categories
                </p>
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Categories
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeCategories}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Creators</p>
                <p className="text-2xl font-bold">{stats.totalCreators}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="categories-search-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Categories Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? `No categories match your search for "${searchQuery}"`
                : "Create your first category to get started"}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleCreateCategory}
                className="bg-gradient-to-r from-primary to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Category Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5" />
              <span>
                {editingCategory ? "Edit Category" : "Create Category"}
              </span>
            </DialogTitle>
          </DialogHeader>

          {errors.submit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter category name"
                  className={errors.name ? "border-red-500" : ""}
                  data-testid="category-name-input"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Category Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="category-slug"
                  className={errors.slug ? "border-red-500" : ""}
                  data-testid="category-slug-input"
                />
                {errors.slug && (
                  <p className="text-sm text-red-600">{errors.slug}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  URL-friendly version of the name
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Brief description of this category"
                data-testid="category-description-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4" />
                <span>Category Image URL</span>
              </Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange("image", e.target.value)}
                placeholder="https://example.com/category-image.jpg"
                data-testid="category-image-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) =>
                    handleInputChange("order", parseInt(e.target.value) || 0)
                  }
                  data-testid="category-order-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleInputChange("isActive", e.target.checked)
                    }
                    className="rounded"
                    data-testid="category-active-toggle"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active (visible to users)
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
                data-testid="cancel-category-btn"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-purple-600"
                data-testid="save-category-btn"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingCategory ? "Update Category" : "Create Category"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Delete Category</span>
            </DialogTitle>
          </DialogHeader>

          {deletingCategory && (
            <div className="space-y-4">
              <p>
                Are you sure you want to delete{" "}
                <strong>"{deletingCategory.name}"</strong>?
              </p>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This action cannot be undone. The category will be removed
                  from {deletingCategory.productCount} products and{" "}
                  {deletingCategory.creatorCount} creators.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingCategory(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleDeleteCategory}
                  disabled={isSubmitting}
                  data-testid="confirm-delete-category-btn"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Category
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CategoriesManagement;
