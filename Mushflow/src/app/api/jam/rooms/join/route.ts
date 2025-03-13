import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { docClient } from '@/lib/dynamodb';
import { QueryCommand, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { roomCode } = body;
    
    if (!roomCode) {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
    }
    
    // Find the room by code
    const roomCodeResult = await docClient.send(new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
      ExpressionAttributeValues: {
        ':pk': 'ROOM_CODE',
        ':sk': roomCode
      }
    }));
    
    if (!roomCodeResult.Items || roomCodeResult.Items.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    
    const roomCodeItem = roomCodeResult.Items[0];
    const roomId = roomCodeItem.roomId;
    
    // Get the actual room data
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
    
    const room = roomResult.Item;
    const timestamp = new Date().toISOString();
    
    // Check if the user is already a participant
    const participantKey = {
      PK: `ROOM#${roomId}`,
      SK: `USER#${session.user.id}`
    };
    
    const existingParticipant = await docClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: participantKey
    }));
    
    // If the user is already a participant, just update their active status
    if (existingParticipant.Item) {
      // Only update if they were previously inactive
      if (existingParticipant.Item.isActive !== true) {
        // Update the participant's active status
        await docClient.send(new PutCommand({
          TableName: process.env.DYNAMODB_TABLE,
          Item: {
            ...existingParticipant.Item,
            isActive: true,
            lastActive: timestamp
          }
        }));
        
        // Update the room's participant count
        await docClient.send(new UpdateCommand({
          TableName: process.env.DYNAMODB_TABLE,
          Key: {
            PK: `ROOM#${roomId}`,
            SK: 'METADATA'
          },
          UpdateExpression: 'SET participantCount = participantCount + :increment',
          ExpressionAttributeValues: {
            ':increment': 1
          }
        }));
        
        // Add a rejoin message
        const messageId = uuidv4();
        await docClient.send(new PutCommand({
          TableName: process.env.DYNAMODB_TABLE,
          Item: {
            PK: `ROOM#${roomId}`,
            SK: `MSG#${timestamp}#${messageId}`,
            GSI1PK: 'SYSTEM',
            GSI1SK: `MSG#${timestamp}`,
            id: messageId,
            roomId,
            senderId: 'SYSTEM',
            senderName: 'System',
            content: `${session.user.name} rejoined the room.`,
            timestamp,
            type: 'SYSTEM_MESSAGE'
          }
        }));
      } else {
        // Just update the last active timestamp
        await docClient.send(new UpdateCommand({
          TableName: process.env.DYNAMODB_TABLE,
          Key: participantKey,
          UpdateExpression: 'SET lastActive = :lastActive',
          ExpressionAttributeValues: {
            ':lastActive': timestamp
          }
        }));
      }
      
      return NextResponse.json({
        success: true,
        room: {
          id: roomId,
          code: roomCode,
          name: room.name,
          bannerId: room.bannerId
        }
      });
    }
    
    // Add the user as a new participant
    const participant = {
      PK: `ROOM#${roomId}`,
      SK: `USER#${session.user.id}`,
      GSI1PK: `USER#${session.user.id}`,
      GSI1SK: `ROOM#${roomId}`,
      userId: session.user.id,
      userName: session.user.name,
      roomId,
      joinedAt: timestamp,
      isActive: true,
      lastActive: timestamp,
      isCreator: false
    };
    
    await docClient.send(new PutCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: participant
    }));
    
    // Update the room's participant count
    await docClient.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: `ROOM#${roomId}`,
        SK: 'METADATA'
      },
      UpdateExpression: 'SET participantCount = participantCount + :increment',
      ExpressionAttributeValues: {
        ':increment': 1
      }
    }));
    
    // Add a join message
    const messageId = uuidv4();
    await docClient.send(new PutCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        PK: `ROOM#${roomId}`,
        SK: `MSG#${timestamp}#${messageId}`,
        GSI1PK: 'SYSTEM',
        GSI1SK: `MSG#${timestamp}`,
        id: messageId,
        roomId,
        senderId: 'SYSTEM',
        senderName: 'System',
        content: `${session.user.name} joined the room.`,
        timestamp,
        type: 'SYSTEM_MESSAGE'
      }
    }));
    
    return NextResponse.json({
      success: true,
      room: {
        id: roomId,
        code: roomCode,
        name: room.name,
        bannerId: room.bannerId
      }
    });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json(
      { error: 'Failed to join room', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 