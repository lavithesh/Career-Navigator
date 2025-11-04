import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import fs from 'fs';

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Ensure the upload directory exists
async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    // Check if directory exists
    try {
      await access(uploadDir);
      console.log('Upload directory exists:', uploadDir);
    } catch (error) {
      // Directory doesn't exist, create it
      console.log('Creating upload directory:', uploadDir);
      await mkdir(uploadDir, { recursive: true });
      console.log('Upload directory created successfully');
    }
    
    // Double check with sync method as fallback
    if (!fs.existsSync(uploadDir)) {
      console.log('Using sync method to create directory');
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Write a test file to verify permissions
    const testFile = path.join(uploadDir, '.test');
    await writeFile(testFile, 'test');
    fs.unlinkSync(testFile); // Remove test file
    console.log('Write permission verified');
    
    return uploadDir;
  } catch (error) {
    console.error('Error setting up upload directory:', error);
    throw new Error('Failed to set up upload directory');
  }
}

// Log request to help with debugging
export async function POST(request: Request) {
  console.log('Upload API called');
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    console.log('Session user:', session?.user?.email);
    
    if (!session || !session.user) {
      console.log('Authentication failed');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get form data with the file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    console.log('File received:', file.name, file.type, file.size, 'bytes');
    
    // Validate file type
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      console.log('Invalid file type:', fileType);
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log('File too large:', file.size, 'bytes');
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }
    
    // Create a unique filename using Node.js built-in crypto module
    const fileExtension = fileType.split('/')[1];
    const fileName = `${Date.now()}-${file.name}`;
    
    // Ensure the upload directory exists
    const uploadDir = await ensureUploadDir();
    
    // Convert the file to an array buffer and then to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write the file to the uploads directory
    const filePath = path.join(uploadDir, fileName);
    console.log('Attempting to save file to:', filePath);
    
    await writeFile(filePath, buffer);
    console.log('File saved successfully');
    
    // Return the URL to the uploaded file
    const fileUrl = `/uploads/${fileName}`;
    console.log('File URL:', fileUrl);
    
    return NextResponse.json({ 
      success: true,
      url: fileUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500 }
    );
  }
}

// ...existing code...
export const dynamic = "force-dynamic";
export const maxSize = 5 * 1024 * 1024; // 5MB
// ...existing code...