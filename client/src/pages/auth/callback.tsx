import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Parse URL search params
  const searchParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast({
        title: 'Authentication Failed',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
      setTimeout(() => setLocation('/login'), 2000);
      return;
    }

    if (token) {
      // Store the token
      localStorage.setItem('authToken', token);
      
      toast({
        title: 'Login Successful',
        description: 'Redirecting to dashboard...',
      });
      
      // Redirect to dashboard
      setTimeout(() => setLocation('/'), 1000);
    } else {
      toast({
        title: 'Authentication Error',
        description: 'No authentication token received',
        variant: 'destructive',
      });
      setTimeout(() => setLocation('/login'), 2000);
    }
  }, [setLocation, toast]);

  const getErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'oauth_failed': 'OAuth authentication failed. Please try again.',
      'callback_failed': 'Authentication callback failed. Please try again.',
      'user_cancelled': 'You cancelled the authentication process.',
    };
    return errorMessages[error] || 'An unknown error occurred during authentication.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Authenticating...</h2>
        <p className="text-gray-300">Please wait while we complete your sign-in</p>
      </div>
    </div>
  );
}

