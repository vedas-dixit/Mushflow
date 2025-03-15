import { NextResponse } from 'next/server';
import { DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';

export async function DELETE(request: Request) {
  try {
    // Get taskId and userId from the URL
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const userId = searchParams.get('userId');
    console.log(taskId, userId);

    if (!taskId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: taskId and userId are required' },
        { status: 400 }
      );
    }

    // First, get the task to ensure it exists and belongs to the user
    const getCommand = new GetCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `TASK#${taskId}`
      }
    });

    const existingTaskResponse = await docClient.send(getCommand);
    
    if (!existingTaskResponse.Item) {
      return NextResponse.json(
        { error: 'Task not found or does not belong to this user' },
        { status: 404 }
      );
    }

    // Delete the task
    const deleteCommand = new DeleteCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: `USER#${userId}`,
        SK: `TASK#${taskId}`
      }
    });

    await docClient.send(deleteCommand);

    return NextResponse.json({ 
      success: true, 
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to delete task', details: errorMessage },
      { status: 500 }
    );
  }
}
