import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  // Only allow this in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    // Create a test account on Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    // Log the test account credentials
    console.log('Test account created:', {
      user: testAccount.user,
      pass: testAccount.pass,
      smtp: {
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
      }
    });

    // Create a transporter with the test account
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Send a test email
    const info = await transporter.sendMail({
      from: '"Code Mentor Test" <test@example.com>',
      to: 'test@example.com',
      subject: 'Test Email from Code Mentor',
      text: 'This is a test email from Code Mentor.',
      html: '<b>This is a test email from Code Mentor.</b>',
    });

    // Log the message URL
    console.log('Message sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

    // Return the test account info and preview URL
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      testAccount: {
        user: testAccount.user,
        pass: testAccount.pass,
        smtp: {
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
        }
      },
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Error sending test email', details: error.message },
      { status: 500 }
    );
  }
} 