'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            A sign in link has been sent to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Click the link in the email to sign in to your account.
            If you don't see the email, check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/auth/signin" className="w-full">
            <Button variant="outline" className="w-full">
              Back to sign in
            </Button>
          </Link>
          <p className="text-xs text-center text-muted-foreground">
            The link is valid for 24 hours.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 