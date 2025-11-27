import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Home, UserX, AlertTriangle, Mail } from "lucide-react";

export default function ProfileDisabled() {
  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="cyber-border bg-white shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <UserX className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Profile Disabled
              </h1>
              <p className="text-gray-600">
                This profile has been temporarily deactivated and is not
                accessible at this time.
              </p>
            </div>

            {/* Information Box */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-orange-800 mb-1">
                    Account Status
                  </h3>
                  <p className="text-sm text-orange-700">
                    This account may have been suspended due to policy
                    violations or is undergoing review by our moderation team.
                  </p>
                </div>
              </div>
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

              <Link href="/contact">
                <Button
                  variant="ghost"
                  className="w-full text-gray-600"
                  data-testid="button-contact"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="mt-6 text-center">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Need Help?</h3>
            <p className="text-white/80 text-sm mb-3">
              If you believe this is an error or need to appeal an account
              suspension:
            </p>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Contact our support team</li>
              <li>• Review our community guidelines</li>
              <li>• Check for violation notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
