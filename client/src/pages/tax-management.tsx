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
import { Badge } from "@/components/ui/badge";
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
import {
  Calculator,
  Plus,
  Edit,
  Trash2,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TaxRate {
  id: string;
  name: string;
  rate: string;
  type: "vat" | "gst" | "sales_tax" | "income_tax";
  country: string;
  state: string | null;
  region: string | null;
  applicableServices: string[];
  isActive: boolean;
  effectiveDate: string;
  expiryDate: string | null;
}

export default function TaxManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxRate | null>(null);
  const queryClient = useQueryClient();

  // Fetch tax rates from API
  const { data: taxRates = [], isLoading } = useQuery<TaxRate[]>({
    queryKey: ["/api/admin/tax-rates"],
    refetchInterval: 60000,
  });

  const { toast } = useToast();

  const createTaxRateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/tax-rates", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tax-rates"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Tax rate created successfully" });
    },
  });

  const updateTaxRateMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) =>
      apiRequest(`/api/admin/tax-rates/${data.id}`, "PATCH", data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tax-rates"] });
      setEditingTax(null);
    },
  });

  const getTaxTypeBadge = (type: string) => {
    const colors = {
      vat: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      gst: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      sales_tax:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      income_tax:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    };
    return (
      <Badge
        className={
          colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {type.toUpperCase()}
      </Badge>
    );
  };

  const calculateTaxExample = (rate: string, amount: number = 100) => {
    const rateNum = parseFloat(rate);
    const tax = (amount * rateNum).toFixed(2);
    const total = (amount + parseFloat(tax)).toFixed(2);
    return { tax, total };
  };

  const TaxRateForm = ({ taxRate, onSubmit, onCancel }: any) => {
    const [formData, setFormData] = useState({
      name: taxRate?.name || "",
      rate: taxRate?.rate || "",
      type: taxRate?.type || "vat",
      country: taxRate?.country || "",
      state: taxRate?.state || "",
      region: taxRate?.region || "",
      applicableServices: taxRate?.applicableServices || [
        "subscriptions",
        "tips",
        "content",
      ],
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Tax Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., UK VAT, California Sales Tax"
              required
              data-testid="input-tax-name"
            />
          </div>
          <div>
            <Label htmlFor="rate">Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              step="0.0001"
              min="0"
              max="1"
              value={formData.rate}
              onChange={(e) =>
                setFormData({ ...formData, rate: e.target.value })
              }
              placeholder="0.20 for 20%"
              required
              data-testid="input-tax-rate"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Tax Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger data-testid="select-tax-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vat">VAT (Value Added Tax)</SelectItem>
                <SelectItem value="gst">GST (Goods & Services Tax)</SelectItem>
                <SelectItem value="sales_tax">Sales Tax</SelectItem>
                <SelectItem value="income_tax">Income Tax</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              placeholder="e.g., United Kingdom, United States"
              required
              data-testid="input-tax-country"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="state">State/Province (Optional)</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              placeholder="e.g., California, Ontario"
              data-testid="input-tax-state"
            />
          </div>
          <div>
            <Label htmlFor="region">Region (Optional)</Label>
            <Input
              id="region"
              value={formData.region}
              onChange={(e) =>
                setFormData({ ...formData, region: e.target.value })
              }
              placeholder="e.g., European Union, NAFTA"
              data-testid="input-tax-region"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" data-testid="button-save-tax">
            {taxRate ? "Update" : "Create"} Tax Rate
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="tax-management"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Management</h1>
          <p className="text-muted-foreground">
            Configure tax rates for global compliance and creator payouts
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-tax-rate">
              <Plus className="h-4 w-4 mr-2" />
              Add Tax Rate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Tax Rate</DialogTitle>
              <DialogDescription>
                Add a new tax rate for compliance with local regulations
              </DialogDescription>
            </DialogHeader>
            <TaxRateForm
              onSubmit={(data: any) => createTaxRateMutation.mutate(data)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tax Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tax Rates
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxRates.length}</div>
            <p className="text-xs text-muted-foreground">
              Active across all regions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(taxRates.map((rate: TaxRate) => rate.country)).size}
            </div>
            <p className="text-xs text-muted-foreground">Tax jurisdictions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VAT Rates</CardTitle>
            <Badge variant="outline">VAT</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taxRates.filter((rate: TaxRate) => rate.type === "vat").length}
            </div>
            <p className="text-xs text-muted-foreground">European compliance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taxRates.length > 0
                ? (
                    (taxRates.reduce(
                      (sum: number, rate: TaxRate) =>
                        sum + parseFloat(rate.rate),
                      0,
                    ) /
                      taxRates.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Average tax burden</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Rates Configuration</CardTitle>
          <CardDescription>
            Manage tax rates for different jurisdictions and service types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Example (on $100)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxRates.map((rate: TaxRate) => {
                const example = calculateTaxExample(rate.rate);
                return (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">{rate.name}</TableCell>
                    <TableCell>{getTaxTypeBadge(rate.type)}</TableCell>
                    <TableCell className="font-mono">
                      {(parseFloat(rate.rate) * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{rate.country}</span>
                        {rate.state && (
                          <span className="text-xs text-muted-foreground">
                            {rate.state}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {rate.applicableServices.slice(0, 2).map((service) => (
                          <Badge
                            key={service}
                            variant="secondary"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                        {rate.applicableServices.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{rate.applicableServices.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="flex flex-col">
                        <span>Tax: ${example.tax}</span>
                        <span className="text-muted-foreground">
                          Total: ${example.total}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {rate.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTax(rate)}
                          data-testid={`button-edit-tax-${rate.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-delete-tax-${rate.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Tax Rate Dialog */}
      <Dialog open={!!editingTax} onOpenChange={() => setEditingTax(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Tax Rate</DialogTitle>
            <DialogDescription>
              Update tax rate configuration for {editingTax?.name}
            </DialogDescription>
          </DialogHeader>
          {editingTax && (
            <TaxRateForm
              taxRate={editingTax}
              onSubmit={(data: any) =>
                updateTaxRateMutation.mutate({
                  id: editingTax.id,
                  updates: data,
                })
              }
              onCancel={() => setEditingTax(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
