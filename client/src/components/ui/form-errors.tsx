import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, X } from "lucide-react";

interface FormErrorsProps {
  errors: Record<string, string> | string[];
  className?: string;
  onDismiss?: () => void;
}

export function FormErrors({
  errors,
  className = "",
  onDismiss,
}: FormErrorsProps) {
  // Handle different error formats
  const errorList = Array.isArray(errors)
    ? errors
    : Object.values(errors).filter(Boolean);

  if (!errorList.length) return null;

  return (
    <Alert variant="destructive" className={`relative ${className}`}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="pr-8">
        <div className="text-sm font-medium mb-2">
          Please correct the following errors:
        </div>
        <ul className="list-none space-y-1">
          {errorList.map((error, index) => (
            <li key={index} className="flex items-start">
              <X className="h-3 w-3 mt-0.5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </li>
          ))}
        </ul>
      </AlertDescription>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-destructive/20 rounded"
          aria-label="Dismiss errors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Alert>
  );
}

export default FormErrors;
