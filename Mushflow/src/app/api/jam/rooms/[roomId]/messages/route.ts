import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { docClient } from '@/lib/dynamodb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { roomId } = params;
    
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }
    
    // Check if the room exists
    const roomResult = await docClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: `ROOM#${roomId}`,
        SK: 'METADATA'
      }
    }));
    
    if (!roomResult.Item) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    // Check if the user is a participant
    const participantKey = {
      PK: `ROOM#${roomId}`,
      SK: `USER#${session.user.id}`
    };
    
    const participantResult = await docClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: participantKey
    }));
    
    if (!participantResult.Item) {
      return NextResponse.json({ error: 'You are not a participant in this room' }, { status: 403 });
    }
    
    // Parse the request body
    const body = await request.json();
    const { content } = body;
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }
    
    // Create a new message
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const message = {
      PK: `ROOM#${roomId}`,
      SK: `MSG#${timestamp}#${messageId}`,
      GSI1PK: `USER#${session.user.id}`,
      GSI1SK: `MSG#${timestamp}`,
      id: messageId,
      roomId,
      senderId: session.user.id,
      senderName: session.user.name,
      content: content.trim(),
      timestamp,
      type: 'USER_MESSAGE'
    };
    
    await docClient.send(new PutCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: message
    }));
    
    // Update participant's last activity
    await docClient.send(new PutCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        ...participantResult.Item,
        lastActive: timestamp
      }
    }));
    
    return NextResponse.json({
      message: {
        id: messageId,
        senderId: session.user.id,
        senderName: session.user.name,
        content: content.trim(),
        timestamp,
        type: 'USER_MESSAGE'
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 