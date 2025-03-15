'use server';

import { Task } from '@/types/Task';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

// Check for required environment variables
const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'mushflow-tasks';
const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Flag to use mock data instead of DynamoDB
const USE_MOCK_DATA = !ACCESS_KEY || !SECRET_KEY || process.env.USE_MOCK_DATA === 'true';

// Initialize DynamoDB client if not using mock data
let client: DynamoDBClient | null = null;
let docClient: any = null;

if (!USE_MOCK_DATA) {
  client = new DynamoDBClient({
    region: REGION,
    credentials: ACCESS_KEY && SECRET_KEY ? {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    } : undefined,
  });
  
  docClient = DynamoDBDocumentClient.from(client);
}

/**
 * Get tasks for a specific user - Server-side function
 */
export async function getTasks(userId: string): Promise<Task[]> {
  if (!userId) {
    console.log('No user ID provided, returning empty tasks array');
    return [];
  }

  // Use mock data if DynamoDB is not configured


  // Check if table name is available
  if (!TABLE_NAME) {
    console.error('DYNAMODB_TABLE_NAME environment variable is not set');
    return [];
  }

  try {
    console.log(`Fetching tasks for user: ${userId} from table: ${TABLE_NAME}`);
    
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :gsi1pk',
      ExpressionAttributeValues: {
        ':gsi1pk': `USER#${userId}`,
      },
    });

    const response = await docClient.send(command);
    
    if (!response.Items || response.Items.length === 0) {
      console.log(`No tasks found for user: ${userId}`);
      return [];
    }

    console.log(`Found ${response.Items.length} tasks for user: ${userId}`);

    // Transform DynamoDB items to Task objects
    const tasks: Task[] = response.Items.map((item: Record<string, any>) => ({
      id: item.id,
      userId: userId,
      title: item.title,
      content: item.content || [],
      priority: item.priority || 'medium',
      color: item.color || 'bg-neutral-800',
      pinned: item.pinned || false,
      completed: item.completed || false,
      dueDate: item.dueDate || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      labels: item.labels || [],
      reminders: item.reminders || [],
      attachments: item.attachments || [],
      recurring: item.recurring || null,
    }));

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
} 