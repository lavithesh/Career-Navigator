'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ClipboardCopy, Mail, Calendar, GithubIcon, Edit, LogOut, Image, User, FileText } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Trophy, Code, CalendarDays } from 'lucide-react'

interface UserDetails {
  _id: string
  name: string
  email: string
  image?: string
  bio?: string
  completedChallenges?: string[]
  submissions?: any[]
  createdAt: string
  updatedAt: string
  emailVerified?: Date | null
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [retries, setRetries] = useState(0)
  const MAX_RETRIES = 3
  const [fetchComplete, setFetchComplete] = useState(false)
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    image: '',
    bio: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading' || fetchComplete) return
    
    if (!session) {
      redirect('/auth/signin?callbackUrl=/profile')
    }

    // Fetch user details from the API with retry
    const fetchUserData = async () => {
      try {
        // If we've already retried a few times, use session data
        if (retries >= MAX_RETRIES) {
          console.log('Using session data after max retries')
          setUserDetails({
            _id: session.user.id || 'unknown',
            name: session.user.name || 'Anonymous User',
            email: session.user.email || 'no-email',
            image: session.user.image || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          setLoading(false)
          setFetchComplete(true)
          return
        }

        // Force cache to be ignored
        const response = await fetch('/api/user', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        if (!response.ok) {
          // If server error (likely DB connection not ready), retry
          if (response.status >= 500) {
            setRetries(prev => prev + 1)
            // Wait a bit before retrying
            setTimeout(fetchUserData, 1000 * retries) // Exponential backoff
            return
          }
          throw new Error('Failed to fetch user data')
        }
        
        const data = await response.json()
        console.log('User data response:', data); // Debug log
        
        // Check if we got data directly or in a user property (depends on API response format)
        const userData = data.user || data;
        
        if (userData) {
          setUserDetails(userData);
          
          // Initialize edit form with current values
          setEditForm({
            name: userData.name || session.user.name || '',
            image: userData.image || session.user.image || '',
            bio: userData.bio || '',
          });
        } else {
          // Fallback to session data if API fails
          setUserDetails({
            _id: session.user.id || 'unknown',
            name: session.user.name || 'Anonymous User',
            email: session.user.email || 'no-email',
            image: session.user.image || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          
          // Initialize edit form with session data
          setEditForm({
            name: session.user.name || '',
            image: session.user.image || '',
            bio: '',
          });
        }
        setFetchComplete(true)
      } catch (error) {
        console.error('Error fetching user data:', error)
        // Fallback to session data if API fails
        setUserDetails({
          _id: session.user.id || 'unknown',
          name: session.user.name || 'Anonymous User',
          email: session.user.email || 'no-email',
          image: session.user.image || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        
        // Initialize edit form with session data
        setEditForm({
          name: session.user.name || '',
          image: session.user.image || '',
          bio: '',
        })
        setFetchComplete(true)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [session, status, retries, fetchComplete])

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  // Copy email to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Email copied",
          description: "Email address copied to clipboard"
        })
      })
      .catch(err => {
        console.error('Could not copy text: ', err)
      })
  }
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Submit profile updates
  const handleSubmitProfileUpdate = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const updatedData = await response.json()
      console.log('Profile updated:', updatedData);
      
      // Update the user details in state
      setUserDetails(prev => ({
        ...prev!,
        ...editForm
      }))
      
      // Close the edit dialog
      setIsEditing(false)
      
      // Show success toast
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated"
      })
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      setError(error.message || 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">User Profile</h1>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error && !userDetails) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-8 flex justify-center">
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!userDetails) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Session Error</AlertTitle>
          <AlertDescription>Session information is missing or invalid.</AlertDescription>
        </Alert>
        <div className="mt-8 flex justify-center">
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <Button variant="destructive" onClick={() => signOut()} className="flex items-center space-x-2">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-20 w-20">
              {userDetails.image ? (
                <AvatarImage src={userDetails.image} alt={userDetails.name} />
              ) : (
                <AvatarFallback>{getInitials(userDetails.name)}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{userDetails.name}</CardTitle>
              <CardDescription>
                <div className="flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{userDetails.email}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-2 h-6 w-6 p-0" 
                    onClick={() => copyToClipboard(userDetails.email || '')}
                  >
                    <ClipboardCopy className="h-3 w-3" />
                  </Button>
                </div>
              </CardDescription>
              {userDetails.bio && (
                <p className="text-sm text-muted-foreground mt-2">{userDetails.bio}</p>
              )}
            </div>
            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">User ID</div>
                    <div className="text-sm text-muted-foreground break-all">
                      {userDetails._id || 'Not available'}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Account Status</div>
                    <div>
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Active
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Email Verification</div>
                    <div>
                      {userDetails.emailVerified ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Member Since</div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {userDetails.createdAt ? formatDate(userDetails.createdAt) : 'Not available'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Authentication</h3>
                <div className="text-sm">
                  {userDetails.image?.includes('github') ? (
                    <div className="flex items-center">
                      <GithubIcon className="h-4 w-4 mr-2" />
                      Signed in with GitHub
                    </div>
                  ) : userDetails.image?.includes('google') ? (
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                        />
                      </svg>
                      Signed in with Google
                    </div>
                  ) : (
                    <div>Signed in with Email</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-6">
            <div className="flex flex-col space-y-2 w-full">
              <div className="text-sm text-muted-foreground">
                Need help? Contact support at support@example.com
              </div>
            </div>
          </CardFooter>
        </Card>
        
        {/* Edit Profile Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image" className="flex items-center">
                  <Image className="h-4 w-4 mr-2" />
                  Profile Picture
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-100">
                    {(editForm.image || userDetails.image) ? (
                      <img
                        src={editForm.image || userDetails.image || ''}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <span className="text-gray-500">{userDetails.name ? getInitials(userDetails.name) : '?'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      Your profile picture is managed in the Settings page.
                    </p>
                    <Link href="/settings" className="text-xs text-primary hover:underline">
                      Go to Settings to update your profile picture
                    </Link>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleSubmitProfileUpdate} 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Activity Tabs */}
        <Tabs defaultValue="progress" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="progress" className="flex-1">Progress</TabsTrigger>
            <TabsTrigger value="submissions" className="flex-1">Submissions</TabsTrigger>
          </TabsList>
          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Progress</CardTitle>
                  <Badge className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {userDetails.completedChallenges?.length || 0} Completed
                  </Badge>
                </div>
                <CardDescription>
                  Track your completed challenges and learning progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userDetails.completedChallenges?.length ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {userDetails.completedChallenges.map((challenge, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border p-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Code className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-sm font-medium">{challenge}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3">
                      <Code className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium">No challenges completed yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-md">
                      Start solving coding challenges to track your progress and build your skills
                    </p>
                    <Link href="/challenges" className="mt-4">
                      <Button>Browse Challenges</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Submissions</CardTitle>
                  <Badge variant="outline">
                    {userDetails.submissions?.length || 0} Total
                  </Badge>
                </div>
                <CardDescription>
                  Your recent code submissions across all challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userDetails.submissions?.length ? (
                  <div className="space-y-4">
                    {userDetails.submissions.slice(0, 5).map((submission, i) => (
                      <div key={i} className="flex flex-col rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{submission.challengeId || 'Challenge'}</h4>
                          <Badge variant={submission.passed ? 'outline' : 'destructive'}>
                            {submission.passed ? 'Passed' : 'Failed'}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Submitted on {formatDate(submission.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3">
                      <Code className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium">No submissions yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-md">
                      Once you start solving challenges, your submissions will appear here
                    </p>
                    <Link href="/challenges" className="mt-4">
                      <Button>Start Coding</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}