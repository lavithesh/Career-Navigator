'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

function ErrorPageContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  // Get error message based on error code
  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Signin':
        return 'Try signing in with a different account.'
      case 'OAuthSignin':
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'EmailCreateAccount':
        return 'There was a problem with your OAuth or email provider. Please try again.'
      case 'OAuthAccountNotLinked':
        return 'To confirm your identity, sign in with the same account you used originally.'
      case 'EmailSignin':
        return 'The email provider is not properly configured or could not send the verification email. Please try using a social login method instead.'
      case 'CredentialsSignin':
        return 'The email or password you entered is incorrect. Please try again.'
      case 'SessionRequired':
        return 'Please sign in to access this page.'
      case 'AccessDenied':
        return 'You do not have permission to access this resource.'
      case 'Configuration':
        return 'There is a problem with the server configuration. Please try again later.'
      case 'Verification':
        return 'The sign in link is no longer valid. It may have expired or been used already.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  // Get additional help information for specific errors
  const getAdditionalHelp = (error: string | null) => {
    switch (error) {
      case 'EmailSignin':
        return 'This is likely due to SMTP configuration issues. Try signing in with GitHub or Google instead.'
      case 'AccessDenied':
        return 'If you believe this is a mistake, please contact the administrator.'
      case 'Verification':
        return 'You can request a new verification email from the sign-in page.'
      default:
        return null;
    }
  }

  const additionalHelp = getAdditionalHelp(error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            Please try signing in again. If the problem persists, please contact support.
          </p>
          
          {additionalHelp && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Troubleshooting:</p>
              <p className="text-sm text-muted-foreground">{additionalHelp}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-3">
          <Link href="/auth/signin">
            <Button>Back to Sign In</Button>
          </Link>
          {error === 'EmailSignin' && (
            <Link href="/auth/signin?tab=providers">
              <Button variant="outline">Try Social Login</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense>
      <ErrorPageContent />
    </Suspense>
  )
}