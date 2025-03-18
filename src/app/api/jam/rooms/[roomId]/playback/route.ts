import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { docClient } from '@/lib/dynamodb';
import { GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';


// Get the tracks table name from environment variables
const TRACKS_TABLE_NAME = process.env.TRACKS_DYNAMODB_TABLE || 'MushflowTracks';
// Get the chat table name from environment variables
const CHAT_TABLE_NAME = process.env.CHAT_DYNAMODB_TABLE || 'MushflowChat';
// Main table name
const MAIN_TABLE_NAME = process.env.DYNAMODB_TABLE;
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { roomId } = await params;
    
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
    }
    
    // Check if the room exists
    const roomResult = await docClient.send(new GetCommand({
      TableName: MAIN_TABLE_NAME,
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
      TableName: MAIN_TABLE_NAME,
      Key: participantKey
    }));
    
    if (!participantResult.Item) {
      return NextResponse.json({ error: 'You are not a participant in this room' }, { status: 403 });
    }
    
    // Parse the request body
    const body = await request.json();
    const { action, trackId } = body;
    
    if (!action || !['PLAY', 'PAUSE', 'CHANGE_TRACK'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    const timestamp = new Date().toISOString();
    let updateExpression = '';
    let expressionAttributeValues: Record<string, any> = {};
    let expressionAttributeNames: Record<string, string> = {};
    let messageContent = '';
    
    // Handle different actions
    switch (action) {
      case 'PLAY':
        updateExpression = 'SET #isPlaying = :isPlaying, #trackStartTime = :trackStartTime';
        expressionAttributeValues = {
          ':isPlaying': true,
          ':trackStartTime': timestamp
        };
        expressionAttributeNames = {
          '#isPlaying': 'isPlaying',
          '#trackStartTime': 'trackStartTime'
        };
        messageContent = `${session.user.name} started playing ${roomResult.Item.currentTrackTitle || 'the music'}`;
        break;
        
      case 'PAUSE':
        updateExpression = 'SET #isPlaying = :isPlaying';
        expressionAttributeValues = {
          ':isPlaying': false
        };
        expressionAttributeNames = {
          '#isPlaying': 'isPlaying'
        };
        messageContent = `${session.user.name} paused the music`;
        break;
        
      case 'CHANGE_TRACK':
        if (!trackId) {
          return NextResponse.json({ error: 'Track ID is required for CHANGE_TRACK action' }, { status: 400 });
        }
        
        // Check if the track exists in the dedicated tracks table
        const trackResult = await docClient.send(new GetCommand({
          TableName: TRACKS_TABLE_NAME,
          Key: {
            PK: `TRACK#${trackId}`,
            SK: 'METADATA'
          }
        }));
        
        if (!trackResult.Item) {
          return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        }
        
        updateExpression = 'SET #currentTrackId = :currentTrackId, #currentTrackTitle = :currentTrackTitle, #isPlaying = :isPlaying, #trackStartTime = :trackStartTime';
        expressionAttributeValues = {
          ':currentTrackId': trackId,
          ':currentTrackTitle': trackResult.Item.title,
          ':isPlaying': true,
          ':trackStartTime': timestamp
        };
        expressionAttributeNames = {
          '#currentTrackId': 'currentTrackId',
          '#currentTrackTitle': 'currentTrackTitle',
          '#isPlaying': 'isPlaying',
          '#trackStartTime': 'trackStartTime'
        };
        messageContent = `${session.user.name} changed the track to "${trackResult.Item.title}" by ${trackResult.Item.artist}`;
        break;
    }
    
    // Update the room
    await docClient.send(new UpdateCommand({
      TableName: MAIN_TABLE_NAME,
      Key: {
        PK: `ROOM#${roomId}`,
        SK: 'METADATA'
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames
    }));
    
    // Add a system message about the action to the chat table
    const messageId = uuidv4();
    
    const message = {
      PK: `ROOM#${roomId}`,
      SK: `MSG#${timestamp}#${messageId}`,
      GSI1PK: `SYSTEM`,
      GSI1SK: `MSG#${timestamp}`,
      id: messageId,
      roomId,
      senderId: 'SYSTEM',
      senderName: 'System',
      content: messageContent,
      timestamp,
      type: 'SYSTEM_MESSAGE'
    };
    
    await docClient.send(new PutCommand({
      TableName: CHAT_TABLE_NAME,
      Item: message
    }));
    
    // Update participant's last activity
    await docClient.send(new PutCommand({
      TableName: MAIN_TABLE_NAME,
      Item: {
        ...participantResult.Item,
        lastActive: timestamp
      }
    }));
    
    // Get the updated room data
    const updatedRoomResult = await docClient.send(new GetCommand({
      TableName: MAIN_TABLE_NAME,
      Key: {
        PK: `ROOM#${roomId}`,
        SK: 'METADATA'
      }
    }));
    
    // Get current track if there is one from the tracks table
    let currentTrack = null;
    if (updatedRoomResult.Item?.currentTrackId) {
      const trackResult = await docClient.send(new GetCommand({
        TableName: TRACKS_TABLE_NAME,
        Key: {
          PK: `TRACK#${updatedRoomResult.Item.currentTrackId}`,
          SK: 'METADATA'
        }
      }));
      
      if (trackResult.Item) {
        currentTrack = {
          id: trackResult.Item.id,
          title: trackResult.Item.title,
          artist: trackResult.Item.artist,
          url: trackResult.Item.url,
          duration: trackResult.Item.duration,
          attribution: trackResult.Item.attribution
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      action,
      room: {
        id: updatedRoomResult.Item?.id,
        isPlaying: updatedRoomResult.Item?.isPlaying,
        trackStartTime: updatedRoomResult.Item?.trackStartTime,
        currentTrack
      },
      message: {
        id: messageId,
        content: messageContent,
        timestamp,
        type: 'SYSTEM_MESSAGE'
      }
    });
  } catch (error) {
    console.error('Error controlling playback:', error);
    return NextResponse.json(
      { error: 'Failed to control playback', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 