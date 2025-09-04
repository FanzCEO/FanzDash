import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  DollarSign,
  Truck,
  Clock,
  Archive,
  Tag,
  Globe,
  AlertTriangle,
  Save,
  X,
  RefreshCw,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  type: "physical" | "digital" | "custom";
  description: string;
  tags: string;
  status: boolean;
  // Physical product fields
  externalLink?: string;
  shippingFee?: number;
  countryFreeShipping?: string;
  quantity?: number;
  boxContents?: string;
  // Custom product fields
  deliveryTime?: number;
  // Category
  category: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
}

interface ProductEditModalProps {
  product: Product | null;
  categories: Category[];
  countries: Country[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
  settings: {
    allowExternalLinksShop: boolean;
    currencySymbol: string;
  };
  className?: string;
}

export function ProductEditModal({
  product,
  categories,
  countries,
  isOpen,
  onClose,
  onSave,
  settings,
  className = "",
}: ProductEditModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    price: 0,
    type: "physical",
    description: "",
    tags: "",
    status: true,
    externalLink: "",
    shippingFee: 0,
    countryFreeShipping: "",
    quantity: 0,
    boxContents: "",
    deliveryTime: 1,
    category: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        tags: product.tags || "",
        externalLink: product.externalLink || "",
        boxContents: product.boxContents || "",
        countryFreeShipping: product.countryFreeShipping || "",
      });
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        price: 0,
        type: "physical",
        description: "",
        tags: "",
        status: true,
        externalLink: "",
        shippingFee: 0,
        countryFreeShipping: "",
        quantity: 0,
        boxContents: "",
        deliveryTime: 1,
        category: "",
      });
    }
    setErrors({});
    setSubmitStatus("idle");
  }, [product, isOpen]);

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (formData.type === "physical") {
      if (formData.shippingFee === undefined || formData.shippingFee < 0) {
        newErrors.shippingFee = "Shipping fee must be 0 or greater";
      }

      if (formData.quantity === undefined || formData.quantity < 0) {
        newErrors.quantity = "Quantity must be 0 or greater";
      }
    }

    if (formData.type === "custom") {
      if (
        !formData.deliveryTime ||
        formData.deliveryTime < 1 ||
        formData.deliveryTime > 30
      ) {
        newErrors.deliveryTime = "Delivery time must be between 1 and 30 days";
      }
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
    setSubmitStatus("idle");

    try {
      await onSave(formData);
      setSubmitStatus("success");
      // Use setTimeout with proper cleanup
      const timer = setTimeout(() => {
        onClose();
      }, 1500);

      // Cleanup function would be needed if this was in useEffect
      // return () => clearTimeout(timer);
    } catch (error: any) {
      setSubmitStatus("error");
      setErrors({ submit: error.message || "Failed to save product" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPhysicalProductFields = () => (
    <>
      {settings.allowExternalLinksShop && (
        <div className="space-y-2">
          <Label htmlFor="externalLink" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>External Purchase Link</span>
          </Label>
          <Input
            id="externalLink"
            type="url"
            value={formData.externalLink || ""}
            onChange={(e) => handleInputChange("externalLink", e.target.value)}
            placeholder="https://yourwebsite.com/purchase-url"
            data-testid="external-link-input"
          />
          <p className="text-xs text-muted-foreground">
            External link where customers can purchase this product
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shippingFee" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Shipping Fee</span>
          </Label>
          <Input
            id="shippingFee"
            type="number"
            min="0"
            step="0.01"
            value={formData.shippingFee || ""}
            onChange={(e) =>
              handleInputChange("shippingFee", parseFloat(e.target.value) || 0)
            }
            placeholder="0.00"
            data-testid="shipping-fee-input"
          />
          {errors.shippingFee && (
            <p className="text-sm text-red-600">{errors.shippingFee}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity" className="flex items-center space-x-2">
            <Archive className="h-4 w-4" />
            <span>Quantity</span>
          </Label>
          <Select
            value={formData.quantity?.toString()}
            onValueChange={(value) =>
              handleInputChange("quantity", parseInt(value))
            }
          >
            <SelectTrigger data-testid="quantity-select">
              <SelectValue placeholder="Select quantity" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 101 }, (_, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.quantity && (
            <p className="text-sm text-red-600">{errors.quantity}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="countryFreeShipping">Country for Free Shipping</Label>
        <Select
          value={formData.countryFreeShipping}
          onValueChange={(value) =>
            handleInputChange("countryFreeShipping", value)
          }
        >
          <SelectTrigger data-testid="free-shipping-country-select">
            <SelectValue placeholder="Select country for free shipping" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No free shipping</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id}>
                {country.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="boxContents">Box Contents</Label>
        <Input
          id="boxContents"
          value={formData.boxContents || ""}
          onChange={(e) => handleInputChange("boxContents", e.target.value)}
          placeholder="What's included in the package"
          data-testid="box-contents-input"
        />
      </div>
    </>
  );

  const renderCustomProductFields = () => (
    <div className="space-y-2">
      <Label htmlFor="deliveryTime" className="flex items-center space-x-2">
        <Clock className="h-4 w-4" />
        <span>Delivery Time</span>
      </Label>
      <Select
        value={formData.deliveryTime?.toString()}
        onValueChange={(value) =>
          handleInputChange("deliveryTime", parseInt(value))
        }
      >
        <SelectTrigger data-testid="delivery-time-select">
          <SelectValue placeholder="Select delivery time" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 30 }, (_, i) => {
            const days = i + 1;
            return (
              <SelectItem key={days} value={days.toString()}>
                {days} {days === 1 ? "day" : "days"}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {errors.deliveryTime && (
        <p className="text-sm text-red-600">{errors.deliveryTime}</p>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>
              {product ? "Edit Product" : "Create Product"}
              {product && (
                <>
                  <span className="mx-2">→</span>
                  <span className="font-normal">{product.name}</span>
                </>
              )}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Status Messages */}
        {submitStatus === "success" && (
          <Alert className="border-green-200 bg-green-50">
            <Save className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Product saved successfully!
            </AlertDescription>
          </Alert>
        )}

        {submitStatus === "error" && errors.submit && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter product name"
                className={errors.name ? "border-red-500" : ""}
                data-testid="product-name-input"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Price ({settings.currencySymbol}) *</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={(e) =>
                    handleInputChange("price", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  className={errors.price ? "border-red-500" : ""}
                  data-testid="product-price-input"
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger
                    className={errors.category ? "border-red-500" : ""}
                    data-testid="product-category-select"
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
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Tags</span>
              </Label>
              <Input
                id="tags"
                value={formData.tags || ""}
                onChange={(e) => handleInputChange("tags", e.target.value)}
                placeholder="tag1, tag2, tag3"
                data-testid="product-tags-input"
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your product..."
                rows={5}
                className={errors.description ? "border-red-500" : ""}
                data-testid="product-description-input"
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Product Type Specific Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Type Settings</h3>

            <div className="flex items-center space-x-2 mb-4">
              <Badge
                variant={formData.type === "physical" ? "default" : "secondary"}
              >
                {formData.type === "physical" && "Physical Product"}
                {formData.type === "digital" && "Digital Product"}
                {formData.type === "custom" && "Custom Service"}
              </Badge>
            </div>

            {formData.type === "physical" && renderPhysicalProductFields()}
            {formData.type === "custom" && renderCustomProductFields()}
          </div>

          <Separator />

          {/* Status Toggle */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>

            <div className="flex items-center space-x-3">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) =>
                  handleInputChange("status", checked)
                }
                data-testid="product-status-toggle"
              />
              <Label htmlFor="status" className="cursor-pointer">
                {formData.status ? "Active" : "Inactive"}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {formData.status
                ? "Product is visible and available for purchase"
                : "Product is hidden from customers"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              data-testid="cancel-product-btn"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-purple-600"
              data-testid="save-product-btn"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {product ? "Update Product" : "Create Product"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProductEditModal;
