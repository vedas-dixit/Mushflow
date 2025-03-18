import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Create a resend instance
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { subject, message, category, userEmail } = await req.json();
    
    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>", // Using Resend's default sender
      to: process.env.ADMIN_EMAIL as string,
      replyTo: userEmail, // Add user's email as reply-to
      subject: `[${category}] ${subject}`,
      html: `
        <div>
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${userEmail || 'No email provided'}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully",
      id: data?.id 
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 