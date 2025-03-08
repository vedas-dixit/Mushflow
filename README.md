# Mushflow - A Modern Productivity Tool for Students

![Mushflow Logo](public/logo.png)

Mushflow is a comprehensive productivity tool designed specifically for students and college-goers. It combines task management, note-taking, collaborative drawing, and a unique "Jam" feature that allows users to work together while listening to synchronized lofi music.

## 🌟 Features

### Task Management
- **Card-based Interface**: Organize tasks as cards similar to Google Keep
- **Rich Task Cards**: Add titles, descriptions, due dates, and file attachments
- **Priority Levels**: Mark tasks as low, medium, or high priority
- **Task Status**: Pin important tasks and mark completed tasks
- **File Attachments**: Upload and manage files directly attached to tasks
- **Labels**: Categorize tasks with customizable labels

### Drawing Canvas
- **Real-time Drawing**: Quick access to a drawing canvas for sketching ideas
- **Save & Export**: Save drawings and attach them to tasks

### Jam Sessions
- **Collaborative Workspaces**: Join or create "Jam" sessions with other users
- **Synchronized Music**: Listen to lofi music together with volume control
- **Global Chat**: Communicate with other users in the Jam session
- **Automatic Session Creation**: System automatically creates sessions with unique names

### Pomodoro Timer
- **Focus Timer**: Built-in Pomodoro timer to enhance productivity
- **Customizable Settings**: Adjust work and break intervals

### User Experience
- **Modern UI**: Clean, intuitive interface with dark mode support
- **Responsive Design**: Works seamlessly across devices
- **Real-time Updates**: Changes sync instantly across devices

## 🛠️ Technology Stack

### Frontend
- **Next.js**: React framework for server-rendered applications
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Beautiful, consistent icon set

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **AWS DynamoDB**: NoSQL database for task storage
- **AWS S3**: File storage for attachments
- **Socket.io**: Real-time communication for Jam sessions

### Authentication
- **NextAuth.js**: Authentication solution for Next.js
- **Google OAuth**: Sign in with Google accounts

## 📋 Architecture

Mushflow follows a modern architecture pattern:

1. **Client-Side**: Next.js with React components for the UI
2. **Server-Side**: Next.js API routes for serverless backend functionality
3. **Database**: AWS DynamoDB for storing tasks, users, and session data
4. **Storage**: AWS S3 for file attachments
5. **Real-time Communication**: Socket.io for Jam sessions and collaborative features

### Key Components

- **Card Component**: The core UI element for displaying tasks
- **Task Service**: Handles CRUD operations for tasks
- **Upload Service**: Manages file uploads and attachments
- **Authentication**: Secures user data and enables personalized experiences
- **Jam Service**: Coordinates collaborative sessions and music synchronization

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- AWS account (for DynamoDB and S3)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/mushflow.git
cd mushflow
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file with the following variables:
```
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
DYNAMODB_TABLE=your-table-name
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Usage

### Task Management
- Click the "+" button to create a new task
- Click on a task card to expand and edit it
- Use the priority flag to set task importance
- Attach files by clicking the paperclip icon
- Set due dates with the calendar icon
- Mark tasks as complete with the checkbox

### Jam Sessions
- Click "Join Jam" to see available sessions
- Select a session to join or create a new one
- Use the volume slider to adjust music volume
- Chat with other participants in the session

### Drawing Canvas
- Click the "Draw" button to open the canvas
- Use the toolbar to select colors and brush sizes
- Save your drawing to attach it to tasks

## 🔜 Roadmap

- **Mobile App**: Native mobile applications for iOS and Android
- **Advanced Music Controls**: Ability to choose music and control playback
- **AI Integration**: Smart task suggestions and organization
- **Calendar Integration**: Sync with Google Calendar and other providers
- **Offline Support**: Full functionality when offline with sync when reconnected

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [AWS](https://aws.amazon.com/)
- [Socket.io](https://socket.io/)
- [Lucide Icons](https://lucide.dev/)

---

Made with ❤️ by Vedas