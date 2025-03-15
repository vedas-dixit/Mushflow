import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Load environment variables
const isLocal = process.env.USE_DYNAMODB_LOCAL === 'true';

// Configure the DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  // If using local DynamoDB, configure endpoint
  ...(isLocal && {
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
    }
  }),
  // If using AWS DynamoDB, configure credentials
  ...(!isLocal && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  })
});

// Create a document client for easier interaction with DynamoDB
const docClient = DynamoDBDocumentClient.from(client);

export { docClient }; 