import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DrawStroke } from '@/types/drawing';

const docClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Save a new stroke
export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stroke } = await request.json();
    
    // Validate required fields
    if (!stroke || !stroke.points || !stroke.color || !stroke.tool) {
      return NextResponse.json(
        { error: 'Invalid stroke data', details: 'Missing required fields' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const strokeId = uuidv4();

    // Prepare the stroke data
    const strokeData = {
      PK: `ROOM#${params.roomId}`,
      SK: `STROKE#${timestamp}#${strokeId}`,
      GSI1PK: `ROOM#${params.roomId}`,
      GSI1SK: `STROKE#${timestamp}`,
      id: strokeId,
      roomId: params.roomId,
      userId: session.user.id,
      userName: session.user.name,
      points: stroke.points,
      color: stroke.color,
      tool: stroke.tool,
      startTime: stroke.startTime || timestamp,
      endTime: stroke.endTime || timestamp,
    };

    // Save to DynamoDB
    await docClient.send(new PutCommand({
      TableName: process.env.DYNAMODB_DRAWING_TABLE,
      Item: strokeData,
    }));

    return NextResponse.json({ 
      success: true, 
      strokeId,
      stroke: strokeData 
    });
  } catch (error) {
    console.error('Error saving stroke:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save stroke', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Get room's drawing history
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { Items } = await docClient.send(new QueryCommand({
      TableName: process.env.DYNAMODB_DRAWING_TABLE,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: `ROOM#${params.roomId}` }
      },
      ScanIndexForward: true, // Get strokes in chronological order
    }));

    const strokes = Items?.map(item => ({
      id: item.id.S,
      roomId: item.roomId.S,
      userId: item.userId.S,
      userName: item.userName.S,
      points: item.points.L?.map((p: any) => ({
        x: p.M?.x.N,
        y: p.M?.y.N,
        color: p.M?.color.S,
        timestamp: p.M?.timestamp.N
      })),
      color: item.color.S,
      tool: item.tool.S,
      startTime: item.startTime.N,
      endTime: item.endTime.N,
    })) || [];

    return NextResponse.json({ strokes });
  } catch (error) {
    console.error('Error fetching strokes:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch strokes', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 