import { NextResponse } from 'next/server';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { CreateTaskInput } from '@/types/Task';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body: CreateTaskInput = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.title) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and title are required' },
        { status: 400 }
      );
    }

    // Generate a unique ID for the task
    const taskId = uuidv4();
    const now = new Date().toISOString();
    
    // Create a new task with PK/SK structure
    const task = {
      // Primary key attributes
      PK: `USER#${body.userId}`,
      SK: `TASK#${taskId}`,
      
      // GSI1 attributes for querying tasks by user and due date
      GSI1PK: `USER#${body.userId}`,
      GSI1SK: body.dueDate ? `TASK#${body.dueDate}` : `TASK#${now}`,
      
      // Task attributes
      id: taskId,
      userId: body.userId,
      title: body.title,
      content: body.content || '',
      
      // Task metadata
      priority: body.priority || 'low',
      labels: body.labels || [],
      dueDate: body.dueDate || null,
      reminders: body.reminders || [],
      attachments: body.attachments || [],
      recurring: body.recurring || null,
      
      // Timestamps
      createdAt: now,
      updatedAt: now,
      
      // Status flags
      pinned: body.pinned || false,
      completed: body.completed || false,
    };

    // Save to DynamoDB
    const command = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: task,
    });

    await docClient.send(command);

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error) {
    console.error('Error adding task:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to add task', details: errorMessage },
      { status: 500 }
    );
  }
} 