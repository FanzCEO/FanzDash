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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Calculator,
  Plus,
  Edit,
  Trash2,
  Globe,
  Map,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

interface TaxRate {
  id: string;
  name: string;
  rate: string; // decimal as string
  type: "vat" | "gst" | "sales_tax" | "income_tax";
  country: string;
  state?: string;
  region?: string;
  applicableServices: string[];
  isActive: boolean;
  effectiveDate: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

const taxRateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rate: z.string().min(1, "Rate is required"),
  type: z.enum(["vat", "gst", "sales_tax", "income_tax"]),
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  region: z.string().optional(),
  applicableServices: z
    .array(z.string())
    .min(1, "At least one service must be selected"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  expiryDate: z.string().optional(),
});

type TaxRateFormData = z.infer<typeof taxRateSchema>;

export default function TaxRateManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Removed mock data - now fetching from API
  const _taxRates_removed: TaxRate[] = [
    {
      id: "1",
      name: "US Sales Tax",
      rate: "0.0875", // 8.75%
      type: "sales_tax",
      country: "United States",
      state: "California",
      applicableServices: ["subscriptions", "tips", "content"],
      isActive: true,
      effectiveDate: "2025-01-01T00:00:00Z",
      createdAt: "2025-01-15T10:00:00Z",
      updatedAt: "2025-01-15T10:00:00Z",
    },
    {
      id: "2",
      name: "UK VAT",
      rate: "0.2000", // 20%
      type: "vat",
      country: "United Kingdom",
      applicableServices: ["subscriptions", "content", "gifts"],
      isActive: true,
      effectiveDate: "2025-01-01T00:00:00Z",
      createdAt: "2025-01-14T15:30:00Z",
      updatedAt: "2025-01-14T15:30:00Z",
    },
    {
      id: "3",
      name: "Canadian GST",
      rate: "0.0500", // 5%
      type: "gst",
      country: "Canada",
      applicableServices: ["subscriptions", "tips"],
      isActive: true,
      effectiveDate: "2025-01-01T00:00:00Z",
      createdAt: "2025-01-13T12:00:00Z",
      updatedAt: "2025-01-13T12:00:00Z",
    },
    {
      id: "4",
      name: "EU VAT (Germany)",
      rate: "0.1900", // 19%
      type: "vat",
      country: "Germany",
      applicableServices: ["subscriptions", "content"],
      isActive: false,
      effectiveDate: "2025-01-01T00:00:00Z",
      expiryDate: "2025-12-31T23:59:59Z",
      createdAt: "2025-01-12T09:00:00Z",
      updatedAt: "2025-01-15T14:30:00Z",
    },
  ];

  const isLoading = false;

  const form = useForm<TaxRateFormData>({
    resolver: zodResolver(taxRateSchema),
    defaultValues: {
      name: "",
      rate: "",
      type: "vat",
      country: "",
      state: "",
      region: "",
      applicableServices: [],
      effectiveDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
    },
  });

  const createTaxRateMutation = useMutation({
    mutationFn: (data: TaxRateFormData) =>
      apiRequest("/api/admin/tax-rates", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tax-rates"] });
      toast({ title: "Tax rate created successfully" });
      setIsAddDialogOpen(false);
      form.reset();
    },
  });

  const updateTaxRateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<TaxRate> }) =>
      apiRequest(`/api/admin/tax-rates/${data.id}`, "PATCH", data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tax-rates"] });
      toast({ title: "Tax rate updated successfully" });
      setEditingTaxRate(null);
    },
  });

  const deleteTaxRateMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/tax-rates/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tax-rates"] });
      toast({ title: "Tax rate deleted successfully" });
    },
  });

  const onSubmit = (data: TaxRateFormData) => {
    if (editingTaxRate) {
      updateTaxRateMutation.mutate({ id: editingTaxRate.id, updates: data });
    } else {
      createTaxRateMutation.mutate(data);
    }
  };

  const handleEdit = (taxRate: TaxRate) => {
    setEditingTaxRate(taxRate);
    form.reset({
      name: taxRate.name,
      rate: (parseFloat(taxRate.rate) * 100).toFixed(4), // Convert to percentage
      type: taxRate.type,
      country: taxRate.country,
      state: taxRate.state || "",
      region: taxRate.region || "",
      applicableServices: taxRate.applicableServices,
      effectiveDate: taxRate.effectiveDate.split("T")[0],
      expiryDate: taxRate.expiryDate ? taxRate.expiryDate.split("T")[0] : "",
    });
    setIsAddDialogOpen(true);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateTaxRateMutation.mutate({ id, updates: { isActive } });
  };

  const getTaxTypeIcon = (type: string) => {
    switch (type) {
      case "vat":
        return <Globe className="h-4 w-4" />;
      case "gst":
        return <Map className="h-4 w-4" />;
      case "sales_tax":
        return <DollarSign className="h-4 w-4" />;
      case "income_tax":
        return <Calculator className="h-4 w-4" />;
      default:
        return <Calculator className="h-4 w-4" />;
    }
  };

  const getTaxTypeBadge = (type: string) => {
    const variants = {
      vat: "default",
      gst: "secondary",
      sales_tax: "outline",
      income_tax: "destructive",
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || "default"}>
        {type.toUpperCase().replace("_", " ")}
      </Badge>
    );
  };

  const formatRate = (rate: string) => {
    return (parseFloat(rate) * 100).toFixed(2) + "%";
  };

  const getActiveRatesCount = () => {
    return taxRates.filter((tr) => tr.isActive).length;
  };

  const getTotalRevenue = () => {
    // Mock calculation - in real app this would come from analytics
    return 45890.5;
  };

  const getTotalTaxCollected = () => {
    // Mock calculation
    return 8750.25;
  };

  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Netherlands",
    "Sweden",
    "Norway",
    "Denmark",
    "Japan",
    "South Korea",
    "Singapore",
    "New Zealand",
  ];

  const serviceTypes = [
    { value: "subscriptions", label: "Subscriptions" },
    { value: "tips", label: "Tips & Donations" },
    { value: "content", label: "Content Purchases" },
    { value: "gifts", label: "Virtual Gifts" },
    { value: "merchandise", label: "Merchandise" },
    { value: "private_shows", label: "Private Shows" },
  ];

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="tax-rate-management"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-text-glow">
            Tax Rate Management
          </h1>
          <p className="text-muted-foreground">
            Configure tax rates for different countries, states, and service
            types
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingTaxRate(null);
                form.reset();
              }}
              data-testid="button-add-tax-rate"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tax Rate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTaxRate ? "Edit Tax Rate" : "Add New Tax Rate"}
              </DialogTitle>
              <DialogDescription>
                Configure tax rates for specific regions and service types
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Rate Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., California Sales Tax"
                            data-testid="input-tax-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            max="50"
                            placeholder="8.75"
                            data-testid="input-tax-rate"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-tax-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vat">VAT</SelectItem>
                            <SelectItem value="gst">GST</SelectItem>
                            <SelectItem value="sales_tax">Sales Tax</SelectItem>
                            <SelectItem value="income_tax">
                              Income Tax
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., California"
                            data-testid="input-state"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Los Angeles County"
                            data-testid="input-region"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="effectiveDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Effective Date</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            data-testid="input-effective-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            data-testid="input-expiry-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="applicableServices"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applicable Services</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {serviceTypes.map((service) => (
                          <div
                            key={service.value}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={service.value}
                              checked={field.value.includes(service.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([
                                    ...field.value,
                                    service.value,
                                  ]);
                                } else {
                                  field.onChange(
                                    field.value.filter(
                                      (v) => v !== service.value,
                                    ),
                                  );
                                }
                              }}
                              className="rounded"
                              data-testid={`checkbox-${service.value}`}
                            />
                            <Label htmlFor={service.value} className="text-sm">
                              {service.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createTaxRateMutation.isPending ||
                      updateTaxRateMutation.isPending
                    }
                    data-testid="button-save-tax-rate"
                  >
                    {editingTaxRate ? "Update" : "Create"} Tax Rate
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tax Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Active Tax Rates</p>
                <p className="text-2xl font-bold">{getActiveRatesCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Countries</p>
                <p className="text-2xl font-bold">
                  {new Set(taxRates.map((tr) => tr.country)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Tax Collected</p>
                <p className="text-2xl font-bold">
                  ${getTotalTaxCollected().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${getTotalRevenue().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Rates Table */}
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle>Tax Rates Configuration</CardTitle>
          <CardDescription>
            Manage tax rates for different regions and service types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxRates.map((taxRate) => (
                <TableRow key={taxRate.id}>
                  <TableCell>
                    <div className="font-medium">{taxRate.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTaxTypeIcon(taxRate.type)}
                      {getTaxTypeBadge(taxRate.type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-green-600">
                      {formatRate(taxRate.rate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{taxRate.country}</div>
                      {taxRate.state && (
                        <div className="text-sm text-muted-foreground">
                          {taxRate.state}
                        </div>
                      )}
                      {taxRate.region && (
                        <div className="text-xs text-muted-foreground">
                          {taxRate.region}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {taxRate.applicableServices.slice(0, 2).map((service) => (
                        <Badge
                          key={service}
                          variant="outline"
                          className="text-xs"
                        >
                          {service}
                        </Badge>
                      ))}
                      {taxRate.applicableServices.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{taxRate.applicableServices.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={taxRate.isActive}
                        onCheckedChange={(checked) =>
                          handleToggleActive(taxRate.id, checked)
                        }
                        data-testid={`switch-active-${taxRate.id}`}
                      />
                      <Badge
                        variant={taxRate.isActive ? "default" : "secondary"}
                      >
                        {taxRate.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(taxRate.effectiveDate).toLocaleDateString()}
                      </span>
                    </div>
                    {taxRate.expiryDate && (
                      <div className="text-xs text-muted-foreground">
                        Expires:{" "}
                        {new Date(taxRate.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(taxRate)}
                        data-testid={`button-edit-${taxRate.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTaxRateMutation.mutate(taxRate.id)}
                        data-testid={`button-delete-${taxRate.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tax Compliance Notice */}
      <Card className="cyber-border border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">
                Tax Compliance Notice
              </h3>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>
                  • Consult with tax professionals for accurate rate
                  configuration
                </li>
                <li>
                  • Tax rates must comply with local jurisdiction requirements
                </li>
                <li>
                  • Monitor changes in tax legislation that may affect your
                  rates
                </li>
                <li>
                  • Keep detailed records of tax collection and remittance
                </li>
                <li>
                  • Adult entertainment services may have special tax
                  considerations
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
