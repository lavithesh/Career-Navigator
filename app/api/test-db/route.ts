import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import { IUser } from '@/models/User';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Get test user by email
    const user = await getUserByEmail('test@example.com') as any;
    
    if (user) {
      return NextResponse.json({ success: true, user });
    }
    
    return NextResponse.json({ success: false, message: 'Test user not found. Use POST to create one.' });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Create a test user
    const testUser = await createUser({
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://via.placeholder.com/150'
    }) as any;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test data created successfully',
      user: testUser
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
} 