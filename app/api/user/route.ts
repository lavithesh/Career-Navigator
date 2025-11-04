import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserByEmail, syncUserFromNextAuth, updateUser, getUserById } from '@/lib/db'
import { dbConnect } from '@/lib/mongoose'

export async function GET() {
  try {
    // Ensure database connection is established
    await dbConnect();

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    try {
      // First try by email
      let user = null;
      if (session.user.email) {
        user = await getUserByEmail(session.user.email);
      }
      
      // If not found by email, try by ID
      if (!user && session.user.id) {
        user = await getUserById(session.user.id);
      }
      
      if (!user) {
        // Check if this is a new user from OAuth that hasn't been saved to our DB yet
        if (session.user.name && session.user.email && session.user.image) {
          // Return session data as fallback for new users
          return NextResponse.json({
            id: session.user.id || 'temp-id',
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
            isNewUser: true
          });
        }
        
        return NextResponse.json(
          { error: 'User not found in database' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(user);
    } catch (dbError: unknown) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: (dbError as Error).message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Ensure database connection is established
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the user's email from the session
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found in session' },
        { status: 400 }
      );
    }

    // Get the profile update data from the request body
    const data = await request.json();

    // Validate the data - name and image are required
    if (!data.name || data.name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    try {
      // Only allow these fields to be updated
      const updateData = {
        name: data.name,
        image: data.image,
        bio: data.bio,
      };

      // Update the user in the database
      const updatedUser = await updateUser(userEmail, updateData);
      
      if (!updatedUser) {
        return NextResponse.json(
          { error: 'User not found or update failed' },
          { status: 404 }
        );
      }

      // Return the updated user details
      return NextResponse.json(updatedUser);
    } catch (dbError: unknown) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error', details: (dbError as Error).message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  console.log('PATCH /api/user called');
  
  try {
    // First ensure the database connection is established
    await dbConnect();
    console.log('Database connected');

    // Get the current session
    const session = await getServerSession(authOptions)
    console.log('Session user:', session?.user?.email);
    
    if (!session || !session.user?.email) {
      console.log('No authenticated user found');
      return NextResponse.json(
        { error: 'You must be signed in to update your profile' },
        { status: 401 }
      )
    }

    try {
      // Parse the request body
      const data = await request.json()
      console.log('Update data received:', data);
      
      // Validate incoming data - only allow specific fields to be updated
      const allowedFields = ['name', 'bio', 'image']
      const updateData: Record<string, any> = {}
      
      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updateData[field] = data[field]
        }
      }
      
      console.log('Filtered update data:', updateData);
      
      if (Object.keys(updateData).length === 0) {
        console.log('No valid fields to update');
        return NextResponse.json(
          { error: 'No valid fields to update' },
          { status: 400 }
        )
      }
      
      // Get the user first
      const user = await getUserByEmail(session.user.email)
      console.log('Found user by email:', user ? 'Yes' : 'No');
      
      if (!user) {
        console.log('User not found in database');
        return NextResponse.json(
          { error: 'User not found in database' },
          { status: 404 }
        )
      }
      
      // Update the user - use email instead of ID to avoid type issues
      console.log('Updating user with email:', session.user.email);
      const updatedUser = await updateUser(session.user.email, updateData)
      console.log('Update result:', updatedUser ? 'Success' : 'Failed');
      
      if (!updatedUser) {
        console.log('Failed to update user');
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        )
      }
      
      // Return updated user data (without password)
      const userData = { ...updatedUser } as any;
      if (userData.password) {
        delete userData.password;
      }
      
      console.log('Returning updated user data');
      return NextResponse.json(
        { 
          success: true,
          message: 'Profile updated successfully',
          user: userData 
        }, 
        { status: 200 }
      )
    } catch (dbError) {
      console.error('Database error updating user:', dbError)
      return NextResponse.json(
        { error: 'Database error updating user' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Server error in user API route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 