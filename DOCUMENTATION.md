# Mushflow - Technical Documentation

This document provides a detailed technical overview of the Mushflow application, including its architecture, components, and implementation details.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [Component Structure](#component-structure)
4. [API Endpoints](#api-endpoints)
5. [Authentication Flow](#authentication-flow)
6. [File Storage System](#file-storage-system)
7. [Real-time Features](#real-time-features)
8. [Styling and UI Framework](#styling-and-ui-framework)
9. [Performance Optimizations](#performance-optimizations)
10. [Future Enhancements](#future-enhancements)

## System Architecture

Mushflow follows a modern serverless architecture built on Next.js:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Next.js Client │────▶│  Next.js API    │────▶│  AWS DynamoDB   │
│  Components     │     │  Routes         │     │  (Data Storage) │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                        │
         │                      │                        │
         ▼                      ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  NextAuth.js    │     │  Socket.io      │     │  AWS S3         │
│  (Auth)         │     │  (Real-time)    │     │  (File Storage) │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Components:

1. **Frontend**: Next.js with React components and TypeScript
2. **Backend**: Next.js API routes (serverless functions)
3. **Database**: AWS DynamoDB for structured data storage
4. **File Storage**: AWS S3 for file attachments
5. **Authentication**: NextAuth.js with Google OAuth
6. **Real-time Communication**: Socket.io for Jam sessions

## Database Schema

Mushflow uses DynamoDB, a NoSQL database, with the following data models:

### Task Table

Primary table with access patterns optimized for user-based queries and due date sorting.

**Table Structure:**
- **Partition Key (PK)**: `USER#{userId}`
- **Sort Key (SK)**: `TASK#{taskId}`
- **GSI1PK**: `USER#{userId}`
- **GSI1SK**: `TASK#{dueDate}` or `TASK#{createdAt}` (for tasks without due dates)

**Item Attributes:**
```typescript
{
  PK: string;              // USER#{userId}
  SK: string;              // TASK#{taskId}
  GSI1PK: string;          // USER#{userId}
  GSI1SK: string;          // TASK#{dueDate} or TASK#{createdAt}
  id: string;              // Unique task ID
  userId: string;          // User ID
  title: string;           // Task title
  content: string;         // Task content
  priority: string;        // "low", "medium", or "high"
  color?: string;          // Optional background color
  labels: string[];        // Array of label IDs
  dueDate: string | null;  // ISO date string or null
  reminders: string[];     // Array of reminder timestamps
  attachments: Attachment[]; // Array of file attachments
  recurring: string | null; // Recurrence pattern or null
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
  pinned: boolean;         // Whether task is pinned
  completed: boolean;      // Whether task is completed
}
```

### Jam Session Table

Stores information about collaborative Jam sessions.

**Table Structure:**
- **Partition Key (PK)**: `JAM#{jamId}`
- **Sort Key (SK)**: `META`

**Item Attributes:**
```typescript
{
  PK: string;              // JAM#{jamId}
  SK: string;              // META
  id: string;              // Unique jam ID
  name: string;            // Jam session name
  createdBy: string;       // User ID of creator
  createdAt: string;       // ISO date string
  participants: string[];  // Array of user IDs
  musicTrack: string;      // Current music track ID
  isActive: boolean;       // Whether session is active
}
```

## Component Structure

Mushflow follows a modular component structure:

### Core Components

1. **Card Component** (`src/components/cards/Card.tsx`)
   - The main task card component
   - Handles task display, editing, and file attachments
   - Manages task status (pinned, completed)
   - Implements priority and due date functionality

2. **CardBox Component** (`src/components/cardbox/CardBox.tsx`)
   - Container for displaying multiple task cards
   - Implements grid layout and responsive design
   - Handles card sorting and filtering

3. **TaskAddBar Component** (`src/components/taskaddbar/TaskAddBar.tsx`)
   - Input bar for creating new tasks
   - Quick-add functionality with title and content

4. **DrawingBoard Component** (`src/components/DrawingBoard/DrawingBoard.tsx`)
   - Canvas for real-time drawing
   - Implements brush tools and color selection
   - Saves drawings as attachments

5. **DatePicker Component** (`src/components/datepickercomponent/DatePickerComponent.tsx`)
   - Modern date picker for setting due dates
   - Supports date selection and clearing

### Page Components

1. **Home Page** (`src/app/page.tsx`)
   - Main dashboard with task management interface
   - Displays task cards and add bar
   - Entry point for the application

2. **Auth Pages** (`src/app/auth/*`)
   - Sign-in and authentication pages
   - Handles OAuth flow and session management

3. **Jam Page** (planned)
   - Interface for collaborative Jam sessions
   - Music player and chat functionality

## API Endpoints

Mushflow implements several API endpoints as Next.js API routes:

### Task Management

1. **GET /api/getTask**
   - Retrieves tasks for a specific user
   - Query parameters: `userId`
   - Returns: Array of Task objects

2. **POST /api/addTask**
   - Creates a new task
   - Body: Task object without ID
   - Returns: Created Task object with ID

3. **PUT /api/updateTask**
   - Updates an existing task
   - Body: Partial Task object with ID and userId
   - Returns: Updated Task object

4. **DELETE /api/deleteTask**
   - Deletes a task
   - Query parameters: `taskId`, `userId`
   - Returns: Success message

### File Management

1. **POST /api/upload**
   - Uploads files to S3 and creates attachment records
   - Body: FormData with files and taskId
   - Returns: Array of created Attachment objects

2. **DELETE /api/upload/[id]**
   - Deletes a file from S3 and removes the attachment record
   - Path parameter: Attachment ID
   - Body: S3 key for deletion
   - Returns: Success message

### Authentication

1. **NextAuth API Routes** (`/api/auth/*`)
   - Handles authentication flow
   - Manages user sessions
   - Implements OAuth providers

## Authentication Flow

Mushflow uses NextAuth.js for authentication:

1. **User Sign-In**:
   - User clicks "Sign In" button
   - Redirected to Google OAuth consent screen
   - Grants permission to the application

2. **OAuth Callback**:
   - Google redirects back to the application
   - NextAuth.js processes the OAuth token
   - Creates or updates user record in the database

3. **Session Management**:
   - NextAuth.js creates a session cookie
   - Session information is available via `useSession` hook
   - Protected routes check for valid session

4. **Sign Out**:
   - User clicks "Sign Out" button
   - NextAuth.js destroys the session
   - User is redirected to the home page

## File Storage System

Mushflow implements a robust file attachment system using AWS S3:

### Upload Process

1. User selects files in the Card component
2. Files are sent to `/api/upload` endpoint as FormData
3. Server uploads files to S3 bucket
4. Server generates signed URLs for file access
5. Attachment records are created and returned to the client
6. Task is updated with new attachment records

### File Structure in S3

Files are organized in S3 using the following pattern:
```
attachments/{uuid}-{filename}
```

### Security Considerations

1. **Signed URLs**: All file access uses signed URLs with expiration times
2. **Authentication**: Upload and delete operations require authentication
3. **Content Type Validation**: Server validates file types before upload
4. **Size Limits**: Enforces maximum file size limits

## Real-time Features

Mushflow implements real-time features using Socket.io:

### Jam Sessions

1. **Session Creation**:
   - User creates a new Jam session
   - Server generates a unique session ID
   - Session is stored in DynamoDB

2. **Joining Sessions**:
   - User selects an active session
   - Socket.io establishes a connection
   - User is added to the session participants

3. **Music Synchronization**:
   - Server controls music playback
   - All participants receive the same audio stream
   - Volume control is client-side

4. **Chat Functionality**:
   - Messages are broadcast to all session participants
   - Message history is stored temporarily

### Drawing Collaboration (Planned)

1. **Shared Canvas**:
   - Multiple users can draw on the same canvas
   - Brush strokes are broadcast in real-time
   - Changes are visible to all participants

## Styling and UI Framework

Mushflow uses Tailwind CSS for styling:

1. **Component Styling**:
   - Utility-first approach with Tailwind classes
   - Custom color scheme with dark mode support
   - Responsive design for all screen sizes

2. **UI Components**:
   - Custom card design with hover effects
   - Modern form elements and buttons
   - Animated transitions and interactions

3. **Icons**:
   - Lucide icon library for consistent visual language
   - Custom icon components for specific features

## Performance Optimizations

Mushflow implements several performance optimizations:

1. **API Request Throttling**:
   - Throttles task update requests to reduce API calls
   - Implements a 800ms delay similar to Google Keep

2. **Optimistic UI Updates**:
   - Updates UI immediately before API confirmation
   - Reverts changes if API request fails

3. **Lazy Loading**:
   - Implements dynamic imports for non-critical components
   - Reduces initial bundle size

4. **Memoization**:
   - Uses React.memo for expensive components
   - Implements useMemo for complex calculations

5. **Server-Side Rendering**:
   - Leverages Next.js SSR for improved initial load
   - Hydrates with client-side data

## Future Enhancements

Planned enhancements for future versions:

1. **Mobile Applications**:
   - Native iOS and Android apps using React Native
   - Push notifications for reminders

2. **Advanced Music Features**:
   - Custom playlist creation
   - Music genre selection
   - Playback controls

3. **AI Integration**:
   - Smart task categorization
   - Priority suggestions
   - Content summarization

4. **Calendar Integration**:
   - Two-way sync with Google Calendar
   - iCalendar export functionality

5. **Offline Support**:
   - IndexedDB for offline data storage
   - Background sync when online

6. **Advanced Collaboration**:
   - Shared task lists
   - Collaborative editing
   - Permission management

---

This documentation is maintained by the Mushflow development team and will be updated as the application evolves. 