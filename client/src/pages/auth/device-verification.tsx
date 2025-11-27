import { useState } from 'react';
import { useLocation } from 'wouter';
import { Shield, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function DeviceVerification() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  // Parse URL search params
  const searchParams = new URLSearchParams(window.location.search);
  const isPending = searchParams.get('pending') === 'true';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    try {
      const response = await apiRequest('/api/auth/verify-device', 'POST', { token });
      
      if (response.success) {
        // Store the auth token
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        
        toast({
          title: 'Device Verified',
          description: 'Your device has been successfully verified',
        });
        
        setTimeout(() => setLocation('/'), 1000);
      } else {
        setError(response.error || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Device Verification Required</CardTitle>
          <CardDescription>
            {isPending
              ? 'We\'ve sent a verification code to your email'
              : 'Enter your verification code to continue'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isPending && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                A verification email has been sent to your registered email address.
                Please check your inbox and enter the verification code below.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                id="token"
                type="text"
                placeholder="Enter verification code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="text-center text-lg tracking-widest"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isVerifying || !token}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Device'
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setLocation('/login')}
              className="text-sm"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

