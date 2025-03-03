import { NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';

export async function GET(request: Request) {
  try {
    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    // Query DynamoDB for tasks by userId using GSI1
    const command = new QueryCommand({
      TableName: process.env.DYNAMODB_TABLE,
      IndexName: 'GSI1', // Using the GSI1 index
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
      },
      // Sort in descending order (newest first)
      ScanIndexForward: false
    });

    const response = await docClient.send(command);

    // Transform the items to match the expected Task interface
    const tasks = (response.Items || []).map(item => ({
      id: item.id,
      userId: item.userId,
      title: item.title,
      content: item.content,
      dueDate: item.dueDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      pinned: item.pinned,
      completed: item.completed
    }));

    return NextResponse.json({ 
      success: true, 
      tasks
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to get tasks', details: errorMessage },
      { status: 500 }
    );
  }
} 