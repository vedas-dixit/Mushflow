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
│  NextAuth.js    │     │   Agora SDK     │     │  AWS S3         │
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
6. **Real-time Communication**: Agora RTM SDK for Jam sessions

### Architecture Details:

1. **Client-Side Rendering**:
   - Uses Next.js App Router with React Server Components
   - Client components marked with "use client" directive
   - Server components fetch data directly from DynamoDB

2. **State Management**:
   - Redux Toolkit for global state management
   - Custom hooks for localized component state
   - RTK Query for API data fetching and caching (planned)

3. **Serverless Functions**:
   - API routes implemented as serverless functions
   - Automatic scaling based on demand
   - Edge functions for low-latency operations (planned)

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
  reminders: string[];     // Array of reminder timestamps (planned)
  attachments: Attachment[]; // Array of file attachments
  recurring: string | null; // Recurrence pattern or null (planned)
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
  pinned: boolean;         // Whether task is pinned
  completed: boolean;      // Whether task is completed
}
```

### Access Patterns:

1. **Get all tasks for a user**:
   - Query on PK = `USER#{userId}`
   - Returns all tasks regardless of status

2. **Get tasks by due date**:
   - Query GSI1 with GSI1PK = `USER#{userId}`
   - Sort by GSI1SK to get chronological order

3. **Get specific task**:
   - GetItem with PK = `USER#{userId}` and SK = `TASK#{taskId}`
   - Direct access by composite key

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
  code: string;            // Unique join code (6 characters)
  name: string;            // Jam session name
  bannerId: number;        // ID of the banner image
  createdBy: string;       // User ID of creator
  createdAt: string;       // ISO date string
  participants: {          // Map of participants
    userId: {
      name: string;        // User's display name
      joinedAt: string;    // ISO date string
      isActive: boolean;   // Whether user is currently active
    }
  };
  musicTrack: {            // Current music track
    id: string;            // Track ID
    name: string;          // Track name
    artist: string;        // Track artist
    url: string;           // Track URL
  };
  isActive: boolean;       // Whether session is active
}
```

### Music Tracks Table

Stores available music tracks for Jam sessions.

**Table Structure:**
- **Partition Key (PK)**: `TRACK#{trackId}`

**Item Attributes:**
```typescript
{
  PK: string;              // TRACK#{trackId}
  id: string;              // Track ID
  name: string;            // Track name
  artist: string;          // Artist name
  duration: number;        // Duration in seconds
  url: string;             // S3 URL for track file
  thumbnailUrl: string;    // S3 URL for track thumbnail
  genre: string;           // Music genre
  createdAt: string;       // ISO date string
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
   - Supports rich text editing and formatting (basic implementation, advanced features planned)
   - Handles drag-and-drop file uploads

2. **CardBox Component** (`src/components/cardbox/CardBox.tsx`)
   - Container for displaying multiple task cards
   - Implements responsive grid layout with CSS Grid
   - Handles card sorting and filtering
   - Implements masonry layout for variable height cards
   - Virtualized rendering for performance with large numbers of cards (planned)

3. **TaskAddBar Component** (`src/components/taskaddbar/TaskAddBar.tsx`)
   - Input bar for creating new tasks
   - Quick-add functionality with title and content
   - Expandable interface with advanced options
   - History management for undo/redo operations
   - Implements keyboard shortcuts
   - Random placeholder text generation for inspiration

4. **DrawingBoard Component** (`src/components/DrawingBoard/Tldraw.tsx`)
   - Canvas for real-time drawing using tldraw library
   - Implements brush tools and color selection
   - Slide-out interface accessible from any view
   - Implements tools for shapes, text, and freehand drawing
   - Preserves drawings between sessions (planned)

5. **DatePicker Component** (`src/components/datepickercomponent/DatePickerComponent.tsx`)
   - Modern date picker for setting due dates
   - Supports date selection and clearing
   - Custom styling to match application theme
   - Accessibility features for keyboard navigation

### Page Components

1. **Home Page** (`src/app/page.tsx`)
   - Main dashboard with task management interface
   - Server component that fetches initial task data
   - Passes data to client components for interactivity
   - Implements error handling for data fetching failures

2. **Auth Pages** (`src/app/auth/*`)
   - Sign-in and authentication pages
   - Handles OAuth flow and session management
   - Implements protected routes with authentication checks
   - Session persistence using cookies

3. **Jam Page** (`src/components/jam/JamPage.tsx`)
   - Interface for collaborative Jam sessions
   - Room creation and joining functionality
   - Real-time participant management
   - Music player integration (basic implementation)
   - Uses Agora RTM for messaging

### Utility Components

1. **Header** (`src/components/Header/header.tsx`)
   - Dynamic header with navigation tabs
   - Search functionality for tasks
   - User profile and settings access
   - Responsive design for mobile and desktop

2. **TaskFilter** (`src/components/taskfilter/TaskFilter.tsx`)
   - Filtering interface for tasks
   - Supports filtering by priority, due date, and labels
   - Implements client-side filtering logic
   - Preserves filter state between navigation

## API Endpoints

Mushflow implements several API endpoints as Next.js API routes:

### Task Management

1. **GET /api/getTask**
   - Retrieves tasks for a specific user
   - Query parameters: `userId`
   - Returns: Array of Task objects
   - Implements pagination for large task sets (planned)
   - Supports filtering via query parameters

2. **POST /api/addTask**
   - Creates a new task
   - Body: Task object without ID
   - Returns: Created Task object with ID
   - Validates input data before creation
   - Generates unique IDs with UUID v4

3. **PUT /api/updateTask**
   - Updates an existing task
   - Body: Partial Task object with ID and userId
   - Returns: Updated Task object
   - Implements partial updates to minimize data transfer
   - Validates input before updating

4. **DELETE /api/deleteTask**
   - Deletes a task
   - Query parameters: `taskId`, `userId`
   - Returns: Success message
   - Implements soft delete for data recovery (planned)

### File Management

1. **POST /api/upload**
   - Uploads files to S3 and creates attachment records
   - Body: FormData with files and taskId
   - Returns: Array of created Attachment objects
   - Validates file types and sizes
   - Generates optimized thumbnails for images (planned)

2. **DELETE /api/upload/[id]**
   - Deletes a file from S3 and removes the attachment record
   - Path parameter: Attachment ID
   - Body: S3 key for deletion
   - Returns: Success message
   - Handles S3 deletion errors gracefully

### Authentication

1. **NextAuth API Routes** (`/api/auth/*`)
   - Handles authentication flow
   - Manages user sessions
   - Implements OAuth providers
   - JWT token management
   - Session persistence and renewal

### Jam Sessions

1. **GET /api/jam/sessions**
   - Retrieves active Jam sessions
   - Query parameters: Optional filters
   - Returns: Array of session objects
   - Filters inactive sessions automatically

2. **POST /api/jam/sessions**
   - Creates a new Jam session
   - Body: Session name and options
   - Returns: Created session with join code
   - Generates unique 6-character join codes

3. **GET /api/jam/sessions/[id]**
   - Retrieves details for a specific session
   - Path parameter: Session ID
   - Returns: Session object with participants
   - Real-time participant status

4. **POST /api/jam/join**
   - Joins an existing session
   - Body: Session code
   - Returns: Session details
   - Validates session code format
   - Adds user to participant list

## Authentication Flow

Mushflow uses NextAuth.js for authentication:

1. **User Sign-In**:
   - User clicks "Sign In" button
   - Redirected to Google OAuth consent screen
   - Grants permission to the application
   - Server validates OAuth response

2. **OAuth Callback**:
   - Google redirects back to the application
   - NextAuth.js processes the OAuth token
   - Creates or updates user record in the database
   - Generates JWT session token

3. **Session Management**:
   - NextAuth.js creates a session cookie
   - Session information is available via `useSession` hook
   - Protected routes check for valid session
   - Session tokens refreshed automatically

4. **Sign Out**:
   - User clicks "Sign Out" button
   - NextAuth.js destroys the session
   - User is redirected to the home page
   - Server invalidates JWT token

### Security Considerations:

1. **CSRF Protection**:
   - Implements CSRF tokens for form submissions
   - Validates token on server-side for all mutations

2. **JWT Security**:
   - Short-lived JWTs with refresh mechanism
   - Secure, HTTP-only cookies
   - Implementation of token rotation (planned)

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

### Technical Implementation:

1. **Client-Side**:
   - Drag-and-drop interface built with custom hooks
   - File preview generation before upload
   - Progress tracking during upload (planned)
   - Error handling with retry mechanism (planned)

2. **Server-Side**:
   - Multipart upload support for large files (planned)
   - Content type detection and validation
   - Virus scanning integration (planned)
   - Metadata preservation

### Security Considerations

1. **Signed URLs**: All file access uses signed URLs with expiration times
2. **Authentication**: Upload and delete operations require authentication
3. **Content Type Validation**: Server validates file types before upload
4. **Size Limits**: Enforces maximum file size limits
5. **Bucket Policies**: Strict S3 bucket policies to prevent public access
6. **Object Lifecycle**: Automatic cleanup of orphaned attachments (planned)

## Real-time Features

Mushflow implements real-time features using Agora RTM SDK:

### Agora Integration Architecture

1. **RTM Provider** (`src/providers/RTMProvider.tsx`):
   - Context provider for Agora RTM client
   - Manages connection lifecycle
   - Provides hooks for RTM functionality
   - Handles reconnection logic

2. **Authentication Flow**:
   - Generates temporary RTM tokens on the server
   - Authenticates RTM client with tokens
   - Implements token refresh before expiration (planned)

3. **Message Schema**:
   - Structured message format with message types
   - JSON serialization for complex data
   - Protocol versioning for future compatibility (planned)

### Jam Sessions

1. **Session Creation**:
   - User creates a new Jam session via API
   - Server generates a unique session ID and join code
   - Session is stored in DynamoDB with creator as first participant
   - RTM channel is automatically created with same ID

2. **Joining Sessions**:
   - User enters join code and submits
   - Server validates code and returns session details
   - Client initializes RTM connection to session channel
   - Presence update sent to all participants
   - UI updates to show all active participants

3. **Real-time Messaging**:
   - Messages are sent via Agora RTM channels
   - Message types include: TEXT, PARTICIPANT_UPDATE, TRACK_CHANGE
   - Messages are received by all session participants
   - UI updates in real-time for all connected clients
   - Offline status detection with heartbeats (planned)

4. **Music Synchronization**:
   - Track selection broadcasts change event via RTM
   - All clients sync to same track
   - Playback status updates shared in real-time (basic implementation)
   - Volume control is client-side only

### Technical Implementation Details

1. **Connection Management**:
   - Automatic reconnection on network failures
   - Session persistence across page reloads
   - Graceful degradation when RTM service is unavailable
   - Proper cleanup on component unmount

2. **Performance Considerations**:
   - Message throttling to prevent flooding (planned)
   - Batch updates for frequent events (planned)
   - Debounced UI updates for rapid messages
   - Memoization of message handlers

3. **Error Handling**:
   - Comprehensive error states for connection issues
   - Fallback to polling when RTM fails (planned)
   - User feedback for connection status
   - Automatic recovery strategies (planned)

## Styling and UI Framework

Mushflow uses Tailwind CSS for styling:

1. **Component Styling**:
   - Utility-first approach with Tailwind classes
   - Custom color scheme with dark mode support
   - Responsive design for all screen sizes
   - Component-specific custom CSS modules for complex cases

2. **UI Components**:
   - Custom card design with hover effects
   - Modern form elements and buttons
   - Animated transitions and interactions
   - Consistent spacing and typography system

3. **Icons**:
   - Lucide icon library for consistent visual language
   - Custom icon components for specific features
   - SVG optimization for performance
   - Semantic icon usage with proper accessibility

4. **Technical Implementation**:
   - JIT compilation for production builds
   - Custom Tailwind plugin for app-specific utilities (planned)
   - CSS variables for theme customization
   - Responsive design system with custom breakpoints

## Performance Optimizations

Mushflow implements several performance optimizations:

1. **API Request Throttling**:
   - Throttles task update requests to reduce API calls
   - Implements a 800ms delay similar to Google Keep
   - Uses debouncing for search and filter operations
   - Batch updates for multiple related changes (planned)

2. **Optimistic UI Updates**:
   - Updates UI immediately before API confirmation
   - Reverts changes if API request fails
   - Maintains temporary offline state (planned)
   - Implements retry logic for failed operations (planned)

3. **Lazy Loading**:
   - Implements dynamic imports for non-critical components
   - Reduces initial bundle size
   - Code-splitting by route and feature
   - Prefetching for likely user paths (planned)

4. **Memoization**:
   - Uses React.memo for expensive components
   - Implements useMemo for complex calculations
   - Custom equality functions for precise updates (planned)
   - Selective rendering with keyed lists

5. **Server-Side Rendering**:
   - Leverages Next.js SSR for improved initial load
   - Hydrates with client-side data
   - Streaming server components for fast first load (planned)
   - Optimized data fetching patterns

6. **Virtualization**:
   - Implements windowing for long lists (planned)
   - Renders only visible content for large task collections (planned)
   - Smooth scrolling with minimal layout shifts (planned)
   - Optimized for low memory consumption

## Future Enhancements

Planned enhancements for future versions:

1. **Mobile Applications** (planned):
   - Native iOS and Android apps using React Native
   - Push notifications for reminders
   - Offline-first architecture
   - Biometric authentication

2. **Advanced Music Features** (partially implemented):
   - Custom playlist creation (planned)
   - Music genre selection (planned)
   - Playback controls
   - Collaborative playlist editing (planned)
   - Music visualization effects (planned)

3. **AI Integration** (planned):
   - Smart task categorization
   - Priority suggestions
   - Content summarization
   - Natural language task creation
   - Automated reminders based on content

4. **Calendar Integration** (planned):
   - Two-way sync with Google Calendar
   - iCalendar export functionality
   - Meeting scheduling and management
   - Time blocking visualization

5. **Offline Support** (planned):
   - IndexedDB for offline data storage
   - Background sync when online
   - Conflict resolution for concurrent edits
   - Progressive enhancement for core functionality

6. **Advanced Collaboration** (planned):
   - Shared task lists
   - Collaborative editing
   - Permission management
   - Activity logs and history
   - Commenting on tasks

7. **Drawing Collaboration** (planned):
   - Multi-user canvas with Agora RTM
   - Real-time cursors and drawing visualization
   - Layer-based drawing with permissions
   - Advanced drawing tools integration

---

This documentation is maintained by the Mushflow development team (one man army: Vedas Dixit) and will be updated as the application evolves. 