import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { docClient } from '@/lib/dynamodb';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Function to generate a random room code (6 characters)
function generateRoomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Function to check if a room code is unique
async function isRoomCodeUnique(code: string) {
  const result = await docClient.send(new QueryCommand({
    TableName: MAIN_TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk',
    ExpressionAttributeValues: {
      ':gsi1pk': 'ROOM_CODE',
      ':gsi1sk': code
    }
  }));
  
  return !result.Items || result.Items.length === 0;
}

// Get the tracks table name from environment variables
const TRACKS_TABLE_NAME = process.env.TRACKS_DYNAMODB_TABLE || 'MushflowTracks';
// Get the chat table name from environment variables
const CHAT_TABLE_NAME = process.env.CHAT_DYNAMODB_TABLE || 'MushflowChat';
// Main table name
const MAIN_TABLE_NAME = process.env.DYNAMODB_TABLE;
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log(request);
    const result = await docClient.send(new QueryCommand({
      TableName: MAIN_TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :gsi1pk',
      ExpressionAttributeValues: {
        ':gsi1pk': 'ROOM'
      }
    }));
    
    // Format the response
    const rooms = result.Items?.map(room => ({
      id: room.id,
      name: room.name,
      code: room.code,
      bannerId: room.bannerId,
      createdAt: room.createdAt,
      createdBy: room.createdBy,
      createdByName: room.createdByName,
      participantCount: room.participantCount || 0
    })) || [];
    
    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Error listing rooms:', error);
    return NextResponse.json(
      { error: 'Failed to list rooms', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, bannerId } = body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }
    
    // Generate a unique room ID and code
    const roomId = uuidv4();
    let roomCode;
    let isUnique = false;
    
    // Keep generating codes until we find a unique one
    while (!isUnique) {
      roomCode = generateRoomCode();
      isUnique = await isRoomCodeUnique(roomCode);
    }
    
    const timestamp = new Date().toISOString();
    

    // Get a default track from the tracks table
    const tracksResult = await docClient.send(new QueryCommand({
      TableName: TRACKS_TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'PUBLIC_TRACKS'
      },
      Limit: 1
    }));
    
    const defaultTrack = tracksResult.Items && tracksResult.Items.length > 0 ? tracksResult.Items[0] : null;
    // Create the room
    const room = {
      PK: `ROOM#${roomId}`,
      SK: 'METADATA',
      GSI1PK: 'ROOM',
      GSI1SK: timestamp,
      id: roomId,
      name: name.trim(),
      code: roomCode,
      bannerId: bannerId || 1,
      createdAt: timestamp,
      createdBy: session.user.id,
      createdByName: session.user.name,
      isPlaying: false,
      participantCount: 1,
      currentTrackId: defaultTrack ? defaultTrack.id : null,
      currentTrackTitle: defaultTrack ? defaultTrack.title : null
    };
    
    await docClient.send(new PutCommand({
      TableName: MAIN_TABLE_NAME,
      Item: room
    }));
    
    // Add room code to GSI for uniqueness check
    await docClient.send(new PutCommand({

      TableName: MAIN_TABLE_NAME,
      Item: {
        PK: `ROOM_CODE#${roomCode}`,
        SK: `ROOM#${roomId}`,
        GSI1PK: 'ROOM_CODE',
        GSI1SK: roomCode,
        roomId
      }
    }));
    
    // Add the creator as a participant
    const participantId = session.user.id;
    await docClient.send(new PutCommand({

      TableName: MAIN_TABLE_NAME,
      Item: {
        PK: `ROOM#${roomId}`,
        SK: `USER#${participantId}`,
        GSI1PK: `USER#${participantId}`,
        GSI1SK: `ROOM#${roomId}`,
        userId: participantId,
        userName: session.user.name,
        roomId,
        joinedAt: timestamp,
        isActive: true,
        lastActive: timestamp,
        isCreator: true
      }
    }));
    
    // Add a welcome message to the chat table
    const messageId = uuidv4();
    await docClient.send(new PutCommand({
      TableName: CHAT_TABLE_NAME,
      Item: {
        PK: `ROOM#${roomId}`,
        SK: `MSG#${timestamp}#${messageId}`,
        GSI1PK: 'SYSTEM',
        GSI1SK: `MSG#${timestamp}`,
        id: messageId,
        roomId,
        senderId: 'SYSTEM',
        senderName: 'System',
        content: `Welcome to ${name.trim()}! Room created by ${session.user.name}.`,
        timestamp,
        type: 'SYSTEM_MESSAGE'
      }
    }));
    
    return NextResponse.json({
      success: true,
      room: {
        id: roomId,
        name: name.trim(),
        code: roomCode,
        bannerId: bannerId || 1,
        createdAt: timestamp,
        createdBy: session.user.id,

        createdByName: session.user.name,
        currentTrackId: defaultTrack ? defaultTrack.id : null,
        currentTrackTitle: defaultTrack ? defaultTrack.title : null

      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 