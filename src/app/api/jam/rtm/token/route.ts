import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { RtmTokenBuilder, RtmRole } from 'agora-access-token';

export async function GET(request: NextRequest) {
  try {
    console.log('RTM token request received');
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('Unauthorized RTM token request - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user ID from the query parameters or use the session user ID
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || session.user.id;
    
    if (!userId) {
      console.log('RTM token request missing user ID');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    console.log(`Generating RTM token for user: ${userId}`);
    
    // Get the Agora App ID and App Certificate from environment variables
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    
    if (!appId || !appCertificate) {
      console.error('Agora App ID or App Certificate is not defined');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    console.log(`Using Agora App ID: ${appId.substring(0, 8)}...`);
    
    // Set token expiration time (24 hours)
    const expirationTimeInSeconds = 24 * 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    
    // Build the RTM token
    // For RTM SDK v2.x, we use the RtmTokenBuilder
    const token = RtmTokenBuilder.buildToken(
      appId,
      appCertificate,
      userId,
      RtmRole.Rtm_User,
      privilegeExpiredTs
    );
    
    console.log(`Generated RTM token for user ${userId}: ${token.substring(0, 20)}...`);
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating RTM token:', error);
    return NextResponse.json(
      { error: 'Failed to generate RTM token', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 