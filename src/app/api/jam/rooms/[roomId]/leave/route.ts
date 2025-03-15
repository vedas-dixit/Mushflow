import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { docClient } from '@/lib/dynamodb';
import { GetCommand, UpdateCommand, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
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
    
    const timestamp = new Date().toISOString();
    const isCreator = participantResult.Item.isCreator === true;
    
    // If the user is the creator, check if there are other participants
    if (isCreator) {
      const participantsResult = await docClient.send(new QueryCommand({
        TableName: process.env.DYNAMODB_TABLE,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `ROOM#${roomId}`,
          ':sk': 'USER#'
        }
      }));
      
      const activeParticipants = participantsResult.Items?.filter(
        p => p.SK !== `USER#${session.user.id}` && p.isActive === true
      ) || [];
      
      if (activeParticipants.length > 0) {
        // If there are other active participants, transfer ownership to the oldest active participant
        const oldestParticipant = activeParticipants.sort(
          (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
        )[0];
        
        // Update the oldest participant to be the new creator
        await docClient.send(new UpdateCommand({
          TableName: process.env.DYNAMODB_TABLE,
          Key: {
            PK: `ROOM#${roomId}`,
            SK: oldestParticipant.SK
          },
          UpdateExpression: 'SET isCreator = :isCreator',
          ExpressionAttributeValues: {
            ':isCreator': true
          }
        }));
        
        // Add a system message about the ownership transfer
        const transferMessageId = uuidv4();
        await docClient.send(new PutCommand({
          TableName: process.env.DYNAMODB_TABLE,
          Item: {
            PK: `ROOM#${roomId}`,
            SK: `MSG#${timestamp}#${transferMessageId}`,
            GSI1PK: 'SYSTEM',
            GSI1SK: `MSG#${timestamp}`,
            id: transferMessageId,
            roomId,
            senderId: 'SYSTEM',
            senderName: 'System',
            content: `${session.user.name} has left the room. ${oldestParticipant.userName} is now the room owner.`,
            timestamp,
            type: 'SYSTEM_MESSAGE'
          }
        }));
        
        // Update the room metadata with the new creator
        await docClient.send(new UpdateCommand({
          TableName: process.env.DYNAMODB_TABLE,
          Key: {
            PK: `ROOM#${roomId}`,
            SK: 'METADATA'
          },
          UpdateExpression: 'SET createdBy = :createdBy, createdByName = :createdByName, participantCount = participantCount - :decrement',
          ExpressionAttributeValues: {
            ':createdBy': oldestParticipant.userId,
            ':createdByName': oldestParticipant.userName,
            ':decrement': 1
          }
        }));
      } else {
        // If there are no other active participants, delete the room and all related items
        
        // First, get all items related to this room
        const roomItemsResult = await docClient.send(new QueryCommand({
          TableName: process.env.DYNAMODB_TABLE,
          KeyConditionExpression: 'PK = :pk',
          ExpressionAttributeValues: {
            ':pk': `ROOM#${roomId}`
          }
        }));
        
        // Delete all room items
        const deletePromises = roomItemsResult.Items?.map(item => 
          docClient.send(new DeleteCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
              PK: item.PK,
              SK: item.SK
            }
          }))
        ) || [];
        
        // Also delete the room code entry
        deletePromises.push(
          docClient.send(new DeleteCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
              PK: `ROOM_CODE#${roomResult.Item.code}`,
              SK: `ROOM#${roomId}`
            }
          }))
        );
        
        await Promise.all(deletePromises);
        
        return NextResponse.json({
          success: true,
          roomDeleted: true,
          message: 'You were the last participant. The room has been deleted.'
        });
      }
    } else {
      // If the user is not the creator, just mark them as inactive
      
      // Update the room's participant count
      await docClient.send(new UpdateCommand({
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
          PK: `ROOM#${roomId}`,
          SK: 'METADATA'
        },
        UpdateExpression: 'SET participantCount = participantCount - :decrement',
        ExpressionAttributeValues: {
          ':decrement': 1
        }
      }));
      
      // Add a system message about the user leaving
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
          content: `${session.user.name} has left the room.`,
          timestamp,
          type: 'SYSTEM_MESSAGE'
        }
      }));
    }
    
    // Mark the user as inactive
    await docClient.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: participantKey,
      UpdateExpression: 'SET isActive = :isActive, lastActive = :lastActive',
      ExpressionAttributeValues: {
        ':isActive': false,
        ':lastActive': timestamp
      }
    }));
    
    return NextResponse.json({
      success: true,
      roomDeleted: false,
      message: 'You have left the room.'
    });
  } catch (error) {
    console.error('Error leaving room:', error);
    return NextResponse.json(
      { error: 'Failed to leave room', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 