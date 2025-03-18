import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Helper function to upload file to S3
async function uploadToS3(file: Buffer, filename: string, contentType: string): Promise<{url: string, previewUrl: string, key: string}> {
  const key = `attachments/${uuidv4()}-${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });
  
  await s3Client.send(command);

  // Generate secure preview URL (correct way)
  const getCommand = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  const previewUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 * 24 * 7 }); // Valid for 7 days
  
  return { url: previewUrl, previewUrl, key };
}

// POST handler for file uploads
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const taskId = formData.get('taskId') as string;
    
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }
    
    const attachments = [];
    
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { url, key } = await uploadToS3(buffer, file.name, file.type);
      
      // Create attachment metadata
      const attachment = {
        id: uuidv4(),
        taskId,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        url,
        key
      };
      
      attachments.push(attachment);
    }
    
    return NextResponse.json({ 
      message: 'Files uploaded successfully',
      attachments
    });
    
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
} 