import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { docClient } from '@/lib/dynamodb';
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

// Get the tracks table name from environment variables
const TRACKS_TABLE_NAME = process.env.TRACKS_DYNAMODB_TABLE || 'MushflowTracks';
// Get the chat table name from environment variables
const CHAT_TABLE_NAME = process.env.CHAT_DYNAMODB_TABLE || 'MushflowChat';
// Main table name
const MAIN_TABLE_NAME = process.env.DYNAMODB_TABLE;

export async function GET(
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
    
    // Get room metadata
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
    
    // Get all participants
    const participantsResult = await docClient.send(new QueryCommand({

      TableName: MAIN_TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${roomId}`,
        ':sk': 'USER#'
      }
    }));
    
    // Get recent messages from the chat table (limited to 50)
    const messagesResult = await docClient.send(new QueryCommand({
      TableName: CHAT_TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `ROOM#${roomId}`,
        ':sk': 'MSG#'
      },
      ScanIndexForward: false, // Get most recent messages first
      Limit: 50
    }));
    

    // Get current track if there is one from the tracks table
    let currentTrack = null;
    if (roomResult.Item.currentTrackId) {
      const trackResult = await docClient.send(new GetCommand({
        TableName: TRACKS_TABLE_NAME,
        Key: {
          PK: `TRACK#${roomResult.Item.currentTrackId}`,
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
    
    // Format the response
    const room = {
      id: roomResult.Item.id,
      name: roomResult.Item.name,
      code: roomResult.Item.code,
      bannerId: roomResult.Item.bannerId,
      isPlaying: roomResult.Item.isPlaying,
      trackStartTime: roomResult.Item.trackStartTime,
      currentTrack,
      participants: participantsResult.Items?.map(p => ({
        id: p.userId,
        name: p.userName,
        isActive: p.isActive,
        joinedAt: p.joinedAt
      })) || [],
      messages: messagesResult.Items?.map(m => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderName,
        content: m.content,
        timestamp: m.timestamp,
        type: m.type
      })).reverse() || [] // Reverse to get chronological order
    };
    
    return NextResponse.json({ room });
  } catch (error) {
    console.error('Error getting room details:', error);
    return NextResponse.json(
      { error: 'Failed to get room details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 