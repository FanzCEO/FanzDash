import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";

export default function NotFound404() {
  const goBack = () => {
    window.history.back();
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="cyber-border bg-white shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <h1 className="text-8xl font-bold text-primary mb-4 cyber-text-glow">
                404
              </h1>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Page Not Found
              </h2>
              <p className="text-gray-600">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={goBack}
                variant="outline"
                className="w-full"
                data-testid="button-go-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>

              <Link href="/">
                <Button className="w-full" data-testid="button-go-home">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </Link>

              <Button
                onClick={refreshPage}
                variant="ghost"
                className="w-full"
                data-testid="button-refresh"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm mb-3">
            Need help? Check these common areas:
          </p>
          <div className="flex justify-center space-x-3">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-gray-200"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/user-management">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-gray-200"
              >
                Users
              </Button>
            </Link>
            <Link href="/settings">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-gray-200"
              >
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
