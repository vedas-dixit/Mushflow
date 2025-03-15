require('dotenv').config();
const { 
  DynamoDBClient, 
  CreateTableCommand, 
  DescribeTableCommand,
  ResourceNotFoundException 
} = require('@aws-sdk/client-dynamodb');
const { 
  DynamoDBDocumentClient, 
  PutCommand,
  QueryCommand 
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Configure the DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);

// Define the table name for tracks
const TRACKS_TABLE_NAME = process.env.TRACKS_DYNAMODB_TABLE || 'MushflowTracks';

// Sample tracks for the JAM feature with corrected metadata
const sampleTracks = [
  {
    id: uuidv4(),
    title: 'A Journey (A Dream of Flight)',
    artist: 'Joe Hisaishi',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/A+Journey+(A+Dream+of+Flight)+-+Joe+Hisaishi.mp3',
    duration: 180,
    attribution: 'Music by Joe Hisaishi',
    isPublic: true,
    tags: ['study', 'focus', 'calm']
  },
  {
    id: uuidv4(),
    title: 'A Town with an Ocean View',
    artist: 'Joe Hisaishi',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/A+Town+with+an+Ocean+View+-+Joe+Hisaishi.mp3',
    duration: 220,
    attribution: 'Music by Joe Hisaishi',
    isPublic: true,
    tags: ['focus', 'study', 'work']
  },
  {
    id: uuidv4(),
    title: 'Country Roads',
    artist: 'Shar',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/country+roads.mp3',
    duration: 240,
    attribution: 'Music by Shar',
    isPublic: true,
    tags: ['focus', 'productivity']
  },
  {
    id: uuidv4(),
    title: 'Deep Concentration',
    artist: 'Study Beats',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/Deep+Concentration.mp3',
    duration: 205,
    attribution: 'Music by Study Beats',
    isPublic: true,
    tags: ['study', 'zen', 'calm']
  },
  {
    id: uuidv4(),
    title: 'Dev Beats',
    artist: 'Coding Vibes',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/Dev+Beats.mp3',
    duration: 190,
    attribution: 'Music by Coding Vibes',
    isPublic: true,
    tags: ['coding', 'development', 'focus']
  },
  {
    id: uuidv4(),
    title: 'Deep Focus',
    artist: 'Study Beats',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/Deep+Focus.mp3',
    duration: 210,
    attribution: 'Music by Study Beats',
    isPublic: true,
    tags: ['concentration', 'study']
  },
  {
    id: uuidv4(),
    title: 'One Summer Day',
    artist: 'Joe Hisaishi',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/One+Summer+Day+-+Joe+Hisaishi.mp3',
    duration: 200,
    attribution: 'Music by Joe Hisaishi',
    isPublic: true,
    tags: ['focus', 'calm', 'relax']
  },
  {
    id: uuidv4(),
    title: 'Focus Flow',
    artist: 'Dev Beats',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/Focus+Flow.mp3',
    duration: 225,
    attribution: 'Music by Dev Beats',
    isPublic: true,
    tags: ['coding', 'study', 'focus']
  },
  {
    id: uuidv4(),
    title: 'Mellow Tunes',
    artist: 'Chill Vibes',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/Mellow+Tunes.mp3',
    duration: 180,
    attribution: 'Music by Chill Vibes',
    isPublic: true,
    tags: ['study', 'relax', 'chill']
  },
  {
    id: uuidv4(),
    title: 'Midnight Study Session',
    artist: 'Late Night Lofi',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/Midnight+Study+Session.mp3',
    duration: 215,
    attribution: 'Music by Late Night Lofi',
    isPublic: true,
    tags: ['study', 'night', 'focus']
  },
  {
    id: uuidv4(),
    title: 'My War',
    artist: 'Kayou Beats',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/My+War+-+Kayou.+Beats.mp3',
    duration: 190,
    attribution: 'Music by Kayou Beats',
    isPublic: true,
    tags: ['energetic', 'focus', 'motivation']
  },
  {
    id: uuidv4(),
    title: 'Peaceful Study',
    artist: 'LoFi Dreams',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/Peaceful+Study.mp3',
    duration: 210,
    attribution: 'Music by LoFi Dreams',
    isPublic: true,
    tags: ['study', 'peaceful', 'focus']
  },
  {
    id: uuidv4(),
    title: 'Relaxing Focus',
    artist: 'Deep LoFi',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/Relaxing+Focus.mp3',
    duration: 220,
    attribution: 'Music by Deep LoFi',
    isPublic: true,
    tags: ['focus', 'study', 'concentration']
  },
  {
    id: uuidv4(),
    title: 'Zen Study Beats',
    artist: 'LoFi Flow',
    url: 'https://mushflow-bucket.s3.us-east-1.amazonaws.com/jam-tracks/Tracks/Zen+Study+Beats.mp3',
    duration: 230,
    attribution: 'Music by LoFi Flow',
    isPublic: true,
    tags: ['productivity', 'work', 'focus']
  }
];

// Function to check if the table exists
async function checkTableExists() {
  try {
    console.log(`Checking if table ${TRACKS_TABLE_NAME} exists...`);
    
    const command = new DescribeTableCommand({
      TableName: TRACKS_TABLE_NAME
    });
    
    await client.send(command);
    console.log(`Table ${TRACKS_TABLE_NAME} already exists.`);
    return true;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      console.log(`Table ${TRACKS_TABLE_NAME} does not exist.`);
      return false;
    }
    console.error(`Error checking table: ${error.message}`);
    throw error;
  }
}

// Function to create the tracks table
async function createTracksTable() {
  console.log(`Creating table ${TRACKS_TABLE_NAME}...`);
  
  const command = new CreateTableCommand({
    TableName: TRACKS_TABLE_NAME,
    AttributeDefinitions: [
      {
        AttributeName: 'PK',
        AttributeType: 'S'
      },
      {
        AttributeName: 'SK',
        AttributeType: 'S'
      },
      {
        AttributeName: 'GSI1PK',
        AttributeType: 'S'
      },
      {
        AttributeName: 'GSI1SK',
        AttributeType: 'S'
      }
    ],
    KeySchema: [
      {
        AttributeName: 'PK',
        KeyType: 'HASH'
      },
      {
        AttributeName: 'SK',
        KeyType: 'RANGE'
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          {
            AttributeName: 'GSI1PK',
            KeyType: 'HASH'
          },
          {
            AttributeName: 'GSI1SK',
            KeyType: 'RANGE'
          }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    BillingMode: 'PROVISIONED',
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  });
  
  try {
    const response = await client.send(command);
    console.log(`Table ${TRACKS_TABLE_NAME} created successfully.`);
    
    // Wait for the table to be active
    console.log('Waiting for table to become active...');
    let tableActive = false;
    while (!tableActive) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const describeCommand = new DescribeTableCommand({
        TableName: TRACKS_TABLE_NAME
      });
      
      const describeResponse = await client.send(describeCommand);
      if (describeResponse.Table.TableStatus === 'ACTIVE') {
        tableActive = true;
        console.log('Table is now active.');
      } else {
        console.log(`Table status: ${describeResponse.Table.TableStatus}. Waiting...`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error creating table: ${error.message}`);
    return false;
  }
}

// Function to add sample tracks to the table
async function addSampleTracks() {
  console.log('Adding sample tracks to the table...');
  
  for (const track of sampleTracks) {
    const item = {
      PK: `TRACK#${track.id}`,
      SK: 'METADATA',
      GSI1PK: 'PUBLIC_TRACKS',
      GSI1SK: `TRACK#${track.id}`,
      id: track.id,
      title: track.title,
      artist: track.artist,
      url: track.url,
      duration: track.duration,
      attribution: track.attribution,
      uploadedAt: new Date().toISOString(),
      isPublic: track.isPublic,
      tags: track.tags
    };
    
    try {
      await docClient.send(new PutCommand({
        TableName: TRACKS_TABLE_NAME,
        Item: item
      }));
      console.log(`Added track: ${track.title}`);
    } catch (error) {
      console.error(`Error adding track ${track.title}: ${error.message}`);
    }
  }
}

// Main function to run the setup
async function setupTracksTable() {
  try {
    // Check if the table exists
    const tableExists = await checkTableExists();
    
    // If the table doesn't exist, create it
    if (!tableExists) {
      const tableCreated = await createTracksTable();
      if (!tableCreated) {
        console.error('Failed to create tracks table. Exiting...');
        return;
      }
    }
    
    // Add sample tracks to the table
    await addSampleTracks();
    
    console.log(`Tracks table setup completed successfully! Table name: ${TRACKS_TABLE_NAME}`);
    
    // Update .env file with the new table name if it doesn't exist
    console.log('Note: Make sure to add TRACKS_DYNAMODB_TABLE=' + TRACKS_TABLE_NAME + ' to your .env file if not already present.');
  } catch (error) {
    console.error(`Error setting up tracks table: ${error.message}`);
  }
}

// Run the setup
setupTracksTable(); 