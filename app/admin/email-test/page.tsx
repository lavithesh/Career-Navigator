'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from 'next-auth/react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

export default function EmailTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailConfig, setEmailConfig] = useState({
    host: '',
    port: '',
    user: '',
    password: '',
    from: ''
  });

  // If not in development mode, show a message
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Email Configuration Test</CardTitle>
            <CardDescription>
              This page is only available in development mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This feature is only available in development mode.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check for authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const generateTestEmail = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-email');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate test email');
      }

      setResult(data);
      
      // Auto-fill the form with the test account details
      if (data.testAccount) {
        setEmailConfig({
          host: data.testAccount.smtp.host,
          port: data.testAccount.smtp.port.toString(),
          user: data.testAccount.user,
          password: data.testAccount.pass,
          from: 'noreply@codementor.com'
        });
      }
    } catch (error: any) {
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration Test</CardTitle>
          <CardDescription>
            Generate test email credentials and update your .env file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-4">
            <Button 
              onClick={generateTestEmail} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Test Email Account'
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="mt-4 space-y-4">
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    Email sent successfully! View the preview here:
                  </AlertDescription>
                </Alert>
                
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm mb-2 font-medium">Preview URL:</p>
                  <a 
                    href={result.previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary break-all"
                  >
                    {result.previewUrl}
                  </a>
                </div>

                <p className="text-sm font-medium mt-4">Copy these values to your .env.local file:</p>
              </div>
            )}
          </div>

          {(result || emailConfig.host) && (
            <div className="space-y-4 border p-4 rounded-md">
              <div className="space-y-2">
                <Label htmlFor="host">EMAIL_SERVER_HOST</Label>
                <div className="flex gap-2">
                  <Input
                    id="host"
                    name="host"
                    value={emailConfig.host}
                    onChange={handleChange}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(emailConfig.host)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="port">EMAIL_SERVER_PORT</Label>
                <div className="flex gap-2">
                  <Input
                    id="port"
                    name="port"
                    value={emailConfig.port}
                    onChange={handleChange}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(emailConfig.port)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="user">EMAIL_SERVER_USER</Label>
                <div className="flex gap-2">
                  <Input
                    id="user"
                    name="user"
                    value={emailConfig.user}
                    onChange={handleChange}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(emailConfig.user)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">EMAIL_SERVER_PASSWORD</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    name="password"
                    type="text"
                    value={emailConfig.password}
                    onChange={handleChange}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(emailConfig.password)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="from">EMAIL_FROM</Label>
                <div className="flex gap-2">
                  <Input
                    id="from"
                    name="from"
                    value={emailConfig.from}
                    onChange={handleChange}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(emailConfig.from)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-md mt-4">
                <p className="text-sm font-medium">Complete .env Configuration:</p>
                <pre className="text-xs overflow-x-auto p-2 mt-2 bg-background">
                  {`# Email Configuration
EMAIL_SERVER_HOST=${emailConfig.host}
EMAIL_SERVER_PORT=${emailConfig.port}
EMAIL_SERVER_USER=${emailConfig.user}
EMAIL_SERVER_PASSWORD=${emailConfig.password}
EMAIL_FROM=${emailConfig.from}`}
                </pre>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="mt-2"
                  onClick={() => copyToClipboard(`# Email Configuration
EMAIL_SERVER_HOST=${emailConfig.host}
EMAIL_SERVER_PORT=${emailConfig.port}
EMAIL_SERVER_USER=${emailConfig.user}
EMAIL_SERVER_PASSWORD=${emailConfig.password}
EMAIL_FROM=${emailConfig.from}`)}
                >
                  Copy All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            After updating your .env.local file, restart the server for changes to take effect.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 