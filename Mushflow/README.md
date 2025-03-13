# Mushflow

## Chat Message Fix

If you're experiencing issues with chat messages being displayed as tasks, or join/leave notifications not appearing, follow these steps:

1. Set up the chat table:
   ```bash
   npm run setup-chat-db
   ```

2. Migrate existing messages to the chat table:
   ```bash
   npm run migrate-messages
   ```

3. Restart the application:
   ```bash
   npm run dev
   ```

This will:
1. Create a separate DynamoDB table for chat messages
2. Move all existing messages from the main table to the chat table
3. Update the application to use the chat table for all future messages

## Updating Music Tracks

To update the music tracks in the DynamoDB database with corrected titles, artists, and URLs:

1. Make sure your AWS credentials are set in the `.env` file
2. Run the update tracks script:
   ```bash
   npm run update-tracks
   ```

If you want to clear existing tracks before adding the new ones:
```bash
npm run update-tracks-clear
```

This will:
1. Add updated tracks with correct metadata to the DynamoDB table
2. Ensure all track URLs are properly formatted
3. Update any rooms to use the new tracks

## Setting Up Dedicated Tracks Table

To set up a dedicated DynamoDB table for music tracks:

1. Make sure your AWS credentials are set in the `.env` file
2. Run the setup tracks table script:
   ```bash
   npm run setup-tracks-db
   ```

This will:
1. Create a new DynamoDB table specifically for music tracks if it doesn't exist
2. Add all tracks with correct metadata to the new table
3. Configure the application to use the dedicated tracks table

## Original README content below: 