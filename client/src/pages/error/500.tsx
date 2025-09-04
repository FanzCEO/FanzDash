import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Home, RefreshCw, AlertTriangle } from "lucide-react";

export default function ServerError500() {
  const goBack = () => {
    window.history.back();
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="cyber-border bg-white shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-6xl font-bold text-red-500 mb-4">500</h1>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Server Error
              </h2>
              <p className="text-gray-600">
                Something went wrong on our servers. We're working to fix it.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={refreshPage}
                className="w-full bg-red-600 hover:bg-red-700"
                data-testid="button-refresh"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>

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
                <Button
                  variant="ghost"
                  className="w-full"
                  data-testid="button-go-home"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm mb-3">
            If this problem persists, please contact support.
          </p>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <p className="text-white text-xs">
              <strong>Error Code:</strong> 500
              <br />
              <strong>Time:</strong> {new Date().toLocaleString()}
              <br />
              <strong>Status:</strong> Internal Server Error
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
