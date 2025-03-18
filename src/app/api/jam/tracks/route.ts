import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { docClient } from '@/lib/dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

// Get the tracks table name from environment variables
const TRACKS_TABLE_NAME = process.env.TRACKS_DYNAMODB_TABLE || 'MushflowTracks';
// Fallback to the main table if tracks table is not defined
const TABLE_NAME = TRACKS_TABLE_NAME || process.env.DYNAMODB_TABLE;

export async function GET(request: NextRequest) {
  console.log(request);
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Query for all public tracks from the dedicated tracks table
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,

      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': 'PUBLIC_TRACKS'
      }
    }));
    
    // Transform the data for the frontend
    const tracks = result.Items?.map(item => ({
      id: item.id,
      title: item.title,
      artist: item.artist,
      url: item.url,
      duration: item.duration,
      attribution: item.attribution
    })) || [];
    
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 