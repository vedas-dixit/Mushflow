# JAM Feature - Mushflow

JAM (Joint Audio Mode) is a collaborative study feature in Mushflow that allows users to study together with synchronized music and chat.

## Features

- **Room Creation**: Create study rooms with custom names and banner images
- **Room Joining**: Join existing rooms using a 6-character room code
- **Synchronized Music**: Listen to the same music at the same time as other participants
- **Chat**: Communicate with other participants in real-time
- **Participant List**: See who's in the room and their active status
- **Music Visualization**: Visual representation of the music being played
- **Mini Player**: Continue listening to music while navigating to other parts of the app
- **Global State Management**: Uses Redux for global state management
- **Authentication Integration**: Requires user authentication to access features

## Components

The JAM feature is built using the following components:

- `JamPage`: The main container component for the JAM feature
- `JamSelection`: The component for creating or joining a room
- `CreateRoomModal`: Modal for creating a new room with customization options
- `JamRoom`: The component for the actual room experience
- `RoomHeader`: Header component for the room with room info and controls
- `MusicPlayer`: Component for controlling music playback
- `MusicVisualization`: Visual representation of the music
- `ParticipantsList`: List of participants in the room
- `ChatArea`: Component for sending and receiving messages
- `MiniPlayer`: Persistent mini player that appears when navigating away from the JAM page
- `LoginModal`: Non-dismissible login modal that appears when authentication is required
- `AppViewManager`: Component that manages the different views in the app based on Redux state
- `AuthSyncProvider`: Provider that syncs NextAuth session with Redux store

## State Management

The JAM feature uses Redux for state management with the following structure:

- `jamSlice`: Redux slice for managing all JAM-related state
  - Room state (roomId, roomCode, roomName, bannerId, inRoom)
  - Music state (currentTrack, isPlaying, volume, trackStartTime)
  - Participants state (list of participants)
  - Chat state (list of messages)
  - UI state (isCreatingRoom, isJoiningRoom, error)

- `navigationSlice`: Redux slice for managing app navigation
  - currentView (notes, jam, pinned)
  - previousView (for navigation history)

- `authSlice`: Redux slice for managing authentication
  - user (user information)
  - status (loading, authenticated, unauthenticated)
  - showLoginModal (whether to show the login modal)

## Usage

1. Click on the "JAM Mode" button in the sidebar
2. If not authenticated, a login modal will appear that cannot be dismissed until the user is authenticated
3. Once authenticated, create a new room or join an existing one with a room code
4. Once in a room, you can:
   - Play/pause the music (synchronized with all participants)
   - Adjust the volume (local only)
   - Send and receive messages
   - See who's in the room
   - Leave the room or share the room code with others
5. When navigating to other parts of the app, the mini player will appear at the bottom of the screen, allowing you to continue listening to the music

## Future Enhancements

- Real-time synchronization using WebSockets
- Custom music upload and playlist creation
- Screen sharing for collaborative work
- Voice chat integration
- Pomodoro timer integration with the JAM session
- Mobile responsiveness improvements
- User presence indicators (typing, away, etc.)
- Emoji reactions to messages
- File sharing in chat 