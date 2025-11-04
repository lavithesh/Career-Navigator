import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { createUser, getUserByEmail, syncUserFromNextAuth } from '@/lib/db';
import dbConnect from '@/lib/mongoose';

export async function POST(request: Request) {
  await dbConnect();
  
  // Get the session
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name, bio, image } = body;
    
    // Get the user's email from the session
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: 'No email found in session' },
        { status: 400 }
      );
    }
    
    // Check if user already exists in database
    let user = await getUserByEmail(userEmail);
    
    if (user) {
      // User already exists, nothing to do
      return NextResponse.json({
        success: true,
        message: 'User profile already exists',
        user: {
          id: (user as any)._id.toString(),
          name: (user as any).name,
          email: (user as any).email,
          image: (user as any).image,
          bio: (user as any).bio || '',
          emailVerified: (user as any).emailVerified,
          createdAt: (user as any).createdAt,
          updatedAt: (user as any).updatedAt
        }
      });
    }
    
    // Try to sync from NextAuth first
    user = await syncUserFromNextAuth(userEmail);
    
    // If still no user, create a new one
    if (!user) {
      const userData = {
        name: name || session.user.name || 'New User',
        email: userEmail,
        image: image || session.user.image,
        bio: bio || '',
        emailVerified: session.user.email ? new Date() : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      user = await createUser(userData);
    }
    
    // Return the created user profile
    return NextResponse.json({
      success: true,
      message: 'User profile created successfully',
      user: {
        id: (user as any)._id.toString(),
        name: (user as any).name,
        email: (user as any).email,
        image: (user as any).image,
        bio: (user as any).bio || '',
        emailVerified: (user as any).emailVerified,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt
      }
    });
    
  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create user profile' },
      { status: 500 }
    );
  }
} 