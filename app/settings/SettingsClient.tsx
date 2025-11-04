'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Upload } from 'lucide-react';

interface UserDetails {
  id: string;
  name?: string;
  email: string;
  image?: string;
  bio?: string;
}

interface ProfileFormState {
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  userDetails: UserDetails | null;
}

export default function SettingsClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formState, setFormState] = useState<ProfileFormState>({
    isLoading: true,
    isSubmitting: false,
    error: null,
    success: false,
    userDetails: null,
  });
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);
  
  // Fetch user details
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetchUserDetails();
    }
  }, [status, session]);
  
  const fetchUserDetails = async () => {
    try {
      const response = await fetch('/api/user');
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      const userData = await response.json();
      setFormState({
        ...formState,
        isLoading: false,
        userDetails: userData,
      });
      
      setName(userData.name || '');
      setBio(userData.bio || '');
      setImageUrl(userData.image || '');
      setPreviewUrl(userData.image || '');
    } catch (error) {
      setFormState({
        ...formState,
        isLoading: false,
        error: 'Failed to load user details',
      });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imageUrl;
    
    setUploadProgress(true);
    
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      setFormState({
        ...formState,
        error: 'Failed to upload image',
      });
      return null;
    } finally {
      setUploadProgress(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFormState({
      ...formState,
      isSubmitting: true,
      error: null,
      success: false,
    });
    
    try {
      // Upload image if there's a new file
      const uploadedImageUrl = await uploadImage();
      
      // If upload failed and we don't have a previous URL, stop
      if (uploadedImageUrl === null && !imageUrl) {
        throw new Error('Failed to upload image');
      }
      
      const finalImageUrl = uploadedImageUrl || imageUrl;
      
      // Update profile data
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          bio,
          image: finalImageUrl,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      // Success
      setFormState({
        ...formState,
        isSubmitting: false,
        success: true,
      });
      
      // Update image URL field
      setImageUrl(finalImageUrl || '');
      
      // Reset upload state
      setImageFile(null);
      
      // Force NextAuth session update
      await fetch('/api/auth/session', { method: 'GET' });
      
      // Add a slight delay before redirecting to the profile page
      setTimeout(() => {
        router.push('/profile');
        // Force a hard refresh of the page
        window.location.href = '/profile';
      }, 1500);
    } catch (error: any) {
      setFormState({
        ...formState,
        isSubmitting: false,
        error: error.message || 'Failed to update profile',
      });
    }
  };
  
  if (status === 'loading' || formState.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {formState.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formState.error}</AlertDescription>
            </Alert>
          )}
          
          {formState.success && (
            <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
              <AlertDescription>Profile updated successfully</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Display Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-100">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="mb-2">
                    <label htmlFor="picture-upload" className="cursor-pointer">
                      <div className="inline-flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                        <Upload className="h-4 w-4" />
                        Choose image
                      </div>
                      <input
                        id="picture-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1">
                Bio
              </label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>
            
            <Button
              type="submit"
              disabled={formState.isSubmitting || uploadProgress}
              className="w-full"
            >
              {(formState.isSubmitting || uploadProgress) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 