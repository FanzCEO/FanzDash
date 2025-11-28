import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  Image,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ShopSettings {
  id: string;
  shopEnabled: boolean;
  allowFreeItems: boolean;
  allowExternalLinks: boolean;
  digitalProductsEnabled: boolean;
  customContentEnabled: boolean;
  physicalProductsEnabled: boolean;
  minPriceProduct: string;
  maxPriceProduct: string;
  commissionRate: string;
}

interface ShopProduct {
  id: string;
  sellerId: string;
  title: string;
  description?: string;
  type: "digital" | "physical" | "custom_content";
  category?: string;
  price: string;
  currency: string;
  imageUrls: string[];
  downloadUrl?: string;
  fileSize?: number;
  externalUrl?: string;
  stock?: number;
  isActive: boolean;
  totalSales: number;
  tags: string[];
  createdAt: string;
}

export default function ShopManagement() {
  const [activeTab, setActiveTab] = useState("settings");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch shop settings from API
  const { data: shopSettings, isLoading: settingsLoading } = useQuery<ShopSettings>({
    queryKey: ["/api/shop/settings"],
    refetchInterval: 30000,
  });

  // Fetch shop products from API
  const { data: shopProducts = [], isLoading: productsLoading } = useQuery<ShopProduct[]>({
    queryKey: ["/api/shop/products"],
    refetchInterval: 15000,
  });

  const _removedMockProducts: ShopProduct[] = [
    {
      id: "1",
      sellerId: "creator_1",
      title: "Premium Photo Set",
      description: "Exclusive high-quality photos",
      type: "digital",
      category: "Photography",
      price: "25.00",
      currency: "USD",
      imageUrls: ["/placeholder.jpg"],
      downloadUrl: "/downloads/photo-set-1.zip",
      fileSize: 15728640, // 15MB
      isActive: true,
      totalSales: 47,
      tags: ["premium", "photos", "exclusive"],
      createdAt: "2025-01-15T10:00:00Z",
    },
    {
      id: "2",
      sellerId: "creator_2",
      title: "Custom Video Request",
      description: "Personalized video content",
      type: "custom_content",
      category: "Custom",
      price: "75.00",
      currency: "USD",
      imageUrls: ["/placeholder.jpg"],
      isActive: true,
      totalSales: 23,
      tags: ["custom", "video", "personal"],
      createdAt: "2025-01-14T15:30:00Z",
    },
    {
      id: "3",
      sellerId: "creator_3",
      title: "Adult Toy Collection",
      description: "Premium adult products",
      type: "physical",
      category: "Adult Products",
      price: "150.00",
      currency: "USD",
      imageUrls: ["/placeholder.jpg"],
      stock: 12,
      isActive: true,
      totalSales: 8,
      tags: ["physical", "adult", "toys"],
      createdAt: "2025-01-13T12:00:00Z",
    },
  ];

  const isLoading = false;

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<ShopSettings>) =>
      apiRequest("/api/admin/shop/settings", "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shop/settings"] });
      toast({ title: "Shop settings updated successfully" });
    },
  });

  const handleSettingsChange = (field: keyof ShopSettings, value: any) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case "digital":
        return <Package className="h-4 w-4" />;
      case "physical":
        return <ShoppingCart className="h-4 w-4" />;
      case "custom_content":
        return <Image className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getProductTypeBadge = (type: string) => {
    const variants = {
      digital: "default",
      physical: "secondary",
      custom_content: "outline",
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || "default"}>
        {type.replace("_", " ")}
      </Badge>
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const calculateRevenue = () => {
    return shopProducts.reduce((total, product) => {
      return total + parseFloat(product.price) * product.totalSales;
    }, 0);
  };

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="shop-management"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-text-glow">
            Shop Management
          </h1>
          <p className="text-muted-foreground">
            Manage digital products, physical items, and custom content
            marketplace
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Store className="h-5 w-5" />
          <span className="text-sm font-medium">
            Revenue: ${calculateRevenue().toFixed(2)}
          </span>
        </div>
      </div>

      {/* Shop Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Shop Status</p>
                <p className="text-2xl font-bold">
                  {shopSettings.shopEnabled ? "Active" : "Disabled"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Products</p>
                <p className="text-2xl font-bold">{shopProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Total Sales</p>
                <p className="text-2xl font-bold">
                  {shopProducts.reduce((sum, p) => sum + p.totalSales, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Revenue</p>
                <p className="text-2xl font-bold">
                  ${calculateRevenue().toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Shop Settings</TabsTrigger>
          <TabsTrigger value="products">
            Products ({shopProducts.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card className="cyber-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Shop Configuration
              </CardTitle>
              <CardDescription>
                Configure marketplace settings and product types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Shop Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="shop-enabled">Enable Shop</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow creators to sell products on the platform
                    </p>
                  </div>
                  <Switch
                    id="shop-enabled"
                    checked={shopSettings.shopEnabled}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("shopEnabled", checked)
                    }
                    data-testid="switch-shop-enabled"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-free">Allow Free Items</Label>
                    <p className="text-sm text-muted-foreground">
                      Permit creators to offer free products
                    </p>
                  </div>
                  <Switch
                    id="allow-free"
                    checked={shopSettings.allowFreeItems}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("allowFreeItems", checked)
                    }
                    data-testid="switch-allow-free"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-external">Allow External Links</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow links to external stores and platforms
                    </p>
                  </div>
                  <Switch
                    id="allow-external"
                    checked={shopSettings.allowExternalLinks}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("allowExternalLinks", checked)
                    }
                    data-testid="switch-allow-external"
                  />
                </div>
              </div>

              {/* Product Types */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Product Types</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="digital-products">Digital Products</Label>
                    <p className="text-sm text-muted-foreground">
                      Photos, videos, audio files, digital downloads
                    </p>
                  </div>
                  <Switch
                    id="digital-products"
                    checked={shopSettings.digitalProductsEnabled}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("digitalProductsEnabled", checked)
                    }
                    data-testid="switch-digital-products"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="custom-content">Custom Content</Label>
                    <p className="text-sm text-muted-foreground">
                      Personalized content and requests
                    </p>
                  </div>
                  <Switch
                    id="custom-content"
                    checked={shopSettings.customContentEnabled}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("customContentEnabled", checked)
                    }
                    data-testid="switch-custom-content"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="physical-products">Physical Products</Label>
                    <p className="text-sm text-muted-foreground">
                      Adult toys, merchandise, physical items
                    </p>
                  </div>
                  <Switch
                    id="physical-products"
                    checked={shopSettings.physicalProductsEnabled}
                    onCheckedChange={(checked) =>
                      handleSettingsChange("physicalProductsEnabled", checked)
                    }
                    data-testid="switch-physical-products"
                  />
                </div>
              </div>

              {/* Pricing Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-price">Minimum Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="min-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={shopSettings.minPriceProduct}
                      onChange={(e) =>
                        handleSettingsChange("minPriceProduct", e.target.value)
                      }
                      className="pl-9"
                      data-testid="input-min-price"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-price">Maximum Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="max-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={shopSettings.maxPriceProduct}
                      onChange={(e) =>
                        handleSettingsChange("maxPriceProduct", e.target.value)
                      }
                      className="pl-9"
                      data-testid="input-max-price"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commission-rate">
                  Platform Commission Rate (%)
                </Label>
                <Input
                  id="commission-rate"
                  type="number"
                  min="0"
                  max="50"
                  step="0.01"
                  value={(
                    parseFloat(shopSettings.commissionRate) * 100
                  ).toFixed(2)}
                  onChange={(e) =>
                    handleSettingsChange(
                      "commissionRate",
                      (parseFloat(e.target.value) / 100).toString(),
                    )
                  }
                  data-testid="input-commission-rate"
                />
                <p className="text-sm text-muted-foreground">
                  Platform fee taken from each sale
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="cyber-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>
                    Manage creator products and marketplace listings
                  </CardDescription>
                </div>
                <Button data-testid="button-add-product">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getProductTypeIcon(product.type)}
                          <div>
                            <div className="font-medium">{product.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.category || "Uncategorized"}
                            </div>
                            {product.type === "digital" && (
                              <div className="text-xs text-muted-foreground">
                                {formatFileSize(product.fileSize)}
                              </div>
                            )}
                            {product.type === "physical" && (
                              <div className="text-xs text-muted-foreground">
                                Stock: {product.stock || 0}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getProductTypeBadge(product.type)}</TableCell>
                      <TableCell>
                        <div className="font-medium">${product.price}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.currency}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{product.totalSales}</div>
                        <div className="text-sm text-muted-foreground">
                          $
                          {(
                            parseFloat(product.price) * product.totalSales
                          ).toFixed(2)}{" "}
                          revenue
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.isActive ? "default" : "secondary"}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-view-${product.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {product.externalUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-external-${product.id}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cyber-border">
              <CardHeader>
                <CardTitle>Sales by Product Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["digital", "custom_content", "physical"].map((type) => {
                    const typeProducts = shopProducts.filter(
                      (p) => p.type === type,
                    );
                    const totalSales = typeProducts.reduce(
                      (sum, p) => sum + p.totalSales,
                      0,
                    );
                    const revenue = typeProducts.reduce(
                      (sum, p) => sum + parseFloat(p.price) * p.totalSales,
                      0,
                    );

                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          {getProductTypeIcon(type)}
                          <span className="capitalize">
                            {type.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{totalSales} sales</div>
                          <div className="text-sm text-muted-foreground">
                            ${revenue.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-border">
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shopProducts
                    .sort((a, b) => b.totalSales - a.totalSales)
                    .slice(0, 5)
                    .map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          {getProductTypeIcon(product.type)}
                          <div>
                            <div className="font-medium">{product.title}</div>
                            <div className="text-sm text-muted-foreground">
                              ${product.price}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {product.totalSales} sales
                          </div>
                          <div className="text-sm text-muted-foreground">
                            $
                            {(
                              parseFloat(product.price) * product.totalSales
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
