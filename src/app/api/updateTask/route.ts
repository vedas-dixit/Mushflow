import { NextResponse } from 'next/server';
import { UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { Task } from '@/types/Task';

export async function PUT(request: Request) {
  try {
    const body: Partial<Task> & { id: string; userId: string } = await request.json();
    
    // Validate required fields
    if (!body.id || !body.userId) {
      return NextResponse.json(
        { error: 'Missing required fields: id and userId are required' },
        { status: 400 }
      );
    }

    // First, get the existing task to ensure it exists and belongs to the user
    const getCommand = new GetCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: `USER#${body.userId}`,
        SK: `TASK#${body.id}`
      }
    });

    const existingTaskResponse = await docClient.send(getCommand);
    
    if (!existingTaskResponse.Item) {
      return NextResponse.json(
        { error: 'Task not found or does not belong to this user' },
        { status: 404 }
      );
    }

    const existingTask = existingTaskResponse.Item as Task;
    const now = new Date().toISOString();
    
    // Prepare update expression and attribute values
    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeValues: Record<string, any> = {
      ':updatedAt': now
    };
    
    // Add fields to update only if they are provided
    if (body.title !== undefined) {
      updateExpression += ', title = :title';
      expressionAttributeValues[':title'] = body.title;
    }
    
    if (body.content !== undefined) {
      updateExpression += ', content = :content';
      expressionAttributeValues[':content'] = body.content;
    }
    
    if (body.priority !== undefined) {
      updateExpression += ', priority = :priority';
      expressionAttributeValues[':priority'] = body.priority;
    }
    
    if (body.labels !== undefined) {
      updateExpression += ', labels = :labels';
      expressionAttributeValues[':labels'] = body.labels;
    }
    
    if (body.pinned !== undefined) {
      updateExpression += ', pinned = :pinned';
      expressionAttributeValues[':pinned'] = body.pinned;
    }
    
    if (body.completed !== undefined) {
      updateExpression += ', completed = :completed';
      expressionAttributeValues[':completed'] = body.completed;
    }
    
    // Handle attachments update
    if (body.attachments !== undefined) {
      updateExpression += ', attachments = :attachments';
      expressionAttributeValues[':attachments'] = body.attachments;
    }
    
    // Handle due date update and GSI1SK update
    if (body.dueDate !== undefined) {
      updateExpression += ', dueDate = :dueDate, GSI1SK = :gsi1sk';
      expressionAttributeValues[':dueDate'] = body.dueDate;
      expressionAttributeValues[':gsi1sk'] = body.dueDate ? `TASK#${body.dueDate}` : `TASK#${existingTask.createdAt}`;
    }
    
    // Update in DynamoDB
    const updateCommand = new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: `USER#${body.userId}`,
        SK: `TASK#${body.id}`
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(updateCommand);
    
    // Transform the response to match the Task interface
    const updatedTask: Task = {
      id: result.Attributes?.id,
      userId: result.Attributes?.userId,
      title: result.Attributes?.title,
      content: result.Attributes?.content,
      priority: result.Attributes?.priority,
      labels: result.Attributes?.labels || [],
      dueDate: result.Attributes?.dueDate,
      reminders: result.Attributes?.reminders || [],
      attachments: result.Attributes?.attachments || [],
      recurring: result.Attributes?.recurring,
      createdAt: result.Attributes?.createdAt,
      updatedAt: result.Attributes?.updatedAt,
      pinned: result.Attributes?.pinned,
      completed: result.Attributes?.completed
    };

    return NextResponse.json({ 
      success: true, 
      task: updatedTask 
    });
  } catch (error) {
    console.error('Error updating task:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to update task', details: errorMessage },
      { status: 500 }
    );
  }
} 