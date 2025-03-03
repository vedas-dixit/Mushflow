# Mushflow

A task management application with DynamoDB integration.

## DynamoDB Setup

This application uses DynamoDB to store tasks. You can use either a local DynamoDB instance for development or connect to AWS DynamoDB in production.

### Local Development Setup

1. Install and run DynamoDB Local:
   - Download DynamoDB Local from: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html
   - Extract and run it with: `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb`

2. Create the required table:
   ```
   npm run setup-db
   ```

3. Start the development server:
   ```
   npm run dev
   ```

### AWS DynamoDB Setup

1. Create the required table in AWS DynamoDB:
   ```
   npm run setup-aws-db
   ```

2. If you need to delete the table:
   ```
   npm run delete-aws-db
   ```

### Environment Variables

The application uses the following environment variables:

```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
DYNAMODB_TABLE=Mushflow
USE_DYNAMODB_LOCAL=false  # Set to true for local development
```

For local development, you can use dummy credentials as the local DynamoDB instance doesn't validate them.

## API Routes

The application provides the following API routes:

- `POST /api/addTask` - Add a new task
- `GET /api/getTask?userId=<userId>` - Get tasks for a specific user

## DynamoDB Table Structure

The DynamoDB table uses a composite key structure with PK (Partition Key) and SK (Sort Key):

- **Primary Key**: Composite of PK and SK
  - PK: `USER#<userId>` (Partition Key)
  - SK: `TASK#<taskId>` (Sort Key)

- **Global Secondary Index (GSI1)**:
  - GSI1PK: `USER#<userId>` (Partition Key)
  - GSI1SK: `TASK#<timestamp>` (Sort Key)

This structure allows for efficient querying of tasks by user ID and sorting by creation time.

## Task Structure

Tasks have the following structure:

```typescript
interface Task {
  id: string;
  userId: string;
  title: string;
  content: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  completed: boolean;
}
```