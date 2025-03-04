# Mushflow - Task Management System

A modern task management application built with Next.js and DynamoDB.

## Features

- Create, view, and manage tasks
- Task prioritization and labeling
- Pin important tasks
- Due date scheduling
- Server-side rendering for improved performance
- Authentication with NextAuth

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- AWS account (for DynamoDB) or use mock data for development

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/mushflow.git
cd mushflow
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory with the following variables:

```
# DynamoDB Configuration
DYNAMODB_TABLE_NAME=mushflow-tasks
AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your-access-key-id
# AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Use mock data for development (remove or set to false in production)
USE_MOCK_DATA=true

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Configuration
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

For development, you can keep `USE_MOCK_DATA=true` to use mock data instead of connecting to DynamoDB.

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### DynamoDB Setup

If you want to use real DynamoDB instead of mock data:

1. Create a DynamoDB table named `mushflow-tasks` with the following schema:
   - Partition key: `PK` (String)
   - Sort key: `SK` (String)
   - GSI1: Partition key `GSI1PK` (String), Sort key `GSI1SK` (String)

2. Create an IAM user with permissions to access this table

3. Update your `.env.local` file with your AWS credentials and set `USE_MOCK_DATA=false`

## Project Structure

- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - React components
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions and services

## Development

### Mock Data

During development, you can use mock data by setting `USE_MOCK_DATA=true` in your `.env.local` file. This will generate random tasks for testing without requiring a DynamoDB connection.

### Authentication

The application uses NextAuth for authentication. For development, you can use the anonymous user ID. For production, set up Google OAuth by providing your Google client ID and secret in the `.env.local` file.

## Deployment

1. Set up a DynamoDB table in your AWS account
2. Configure environment variables in your hosting platform
3. Deploy the application

```bash
npm run build
npm start
```

## License

This project is licensed under the MIT License.