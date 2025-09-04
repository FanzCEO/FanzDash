import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Home, RefreshCw, Wrench, Clock } from "lucide-react";

export default function Maintenance503() {
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="cyber-border bg-white shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Wrench className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-bounce" />
              <h1 className="text-4xl font-bold text-blue-600 mb-4">
                Maintenance Mode
              </h1>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Sorry for the inconvenience
              </h2>
              <p className="text-gray-600">
                We're currently performing scheduled maintenance to improve your
                experience. We'll be back online shortly.
              </p>
            </div>

            {/* Maintenance Status */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">
                  Estimated Time
                </span>
              </div>
              <p className="text-blue-700 text-sm">
                Maintenance usually takes 30-60 minutes
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={refreshPage}
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="button-refresh"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>

              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full"
                  data-testid="button-go-home"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Try Homepage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Information */}
        <div className="mt-6 text-center">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">What's happening?</h3>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• System upgrades and optimizations</li>
              <li>• Security updates and patches</li>
              <li>• Performance improvements</li>
              <li>• Database maintenance</li>
            </ul>
          </div>

          <p className="text-white/60 text-xs mt-4">
            Thank you for your patience while we make improvements.
          </p>
        </div>
      </div>
    </div>
  );
}
