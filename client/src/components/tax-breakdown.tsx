import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign } from "lucide-react";

interface TaxRate {
  id: string;
  name: string;
  percentage: number;
}

interface TaxBreakdownProps {
  subtotal: number;
  taxRates: TaxRate[];
  currencySymbol: string;
  showSubtotal?: boolean;
  className?: string;
}

export function TaxBreakdown({
  subtotal,
  taxRates,
  currencySymbol,
  showSubtotal = true,
  className = "",
}: TaxBreakdownProps) {
  const taxAmounts = taxRates.map((tax) => ({
    ...tax,
    amount: (subtotal * tax.percentage) / 100,
  }));

  const totalTaxes = taxAmounts.reduce((sum, tax) => sum + tax.amount, 0);
  const total = subtotal + totalTaxes;

  if (subtotal === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-3">
            <Calculator className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Price Breakdown</span>
          </div>

          {/* Subtotal */}
          {showSubtotal && (
            <div className="flex justify-between items-center text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">
                {currencySymbol}
                <span data-testid="subtotal-amount">{subtotal.toFixed(2)}</span>
              </span>
            </div>
          )}

          {/* Tax Items */}
          {taxAmounts.map((tax, index) => (
            <div
              key={tax.id}
              className="flex justify-between items-center text-sm"
              data-testid={`tax-item-${index + 1}`}
            >
              <span>
                {tax.name} {tax.percentage}%:
              </span>
              <span className="font-semibold">
                {currencySymbol}
                <span data-testid={`tax-amount-${index + 1}`}>
                  {tax.amount.toFixed(2)}
                </span>
              </span>
            </div>
          ))}

          {/* Total */}
          <div className="border-t pt-2 flex justify-between items-center font-semibold">
            <span>Total:</span>
            <div className="flex items-center space-x-1">
              <Badge variant="default" className="bg-primary">
                <DollarSign className="h-3 w-3 mr-1" />
                <span data-testid="total-amount">{total.toFixed(2)}</span>
              </Badge>
            </div>
          </div>

          {/* Tax Summary */}
          {taxRates.length > 0 && (
            <div className="text-xs text-muted-foreground text-center pt-1">
              Total taxes: {currencySymbol}
              {totalTaxes.toFixed(2)}(
              {((totalTaxes / subtotal) * 100).toFixed(1)}%)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TaxBreakdown;
