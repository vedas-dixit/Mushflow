// This script deletes the DynamoDB table in AWS
const { DynamoDBClient, DeleteTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

// Configure the DynamoDB client for AWS
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const tableName = process.env.DYNAMODB_TABLE || 'Mushflow';

async function deleteTable() {
  try {
    console.log(`Attempting to delete table: ${tableName}`);
    
    const command = new DeleteTableCommand({
      TableName: tableName
    });
    
    await client.send(command);
    console.log(`Table ${tableName} deleted successfully.`);
    
    // Wait for the table to be fully deleted
    console.log('Waiting for table deletion to complete...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    console.log('Table deletion should be complete. You can now recreate the table.');
    
  } catch (error) {
    console.error('Error deleting table:', error);
  }
}

deleteTable();