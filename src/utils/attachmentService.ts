// Define the Attachment interface
export interface Attachment {
  id: string;
  taskId: string;
  filename: string;
  url: string;
  contentType: string;
  size: number;
  key: string; // Store the S3 key for deletion
}

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Get file icon based on content type
export const getFileIcon = (contentType: string): string => {
  if (contentType.startsWith('image/')) return '🖼️';
  if (contentType.startsWith('video/')) return '🎬';
  if (contentType.startsWith('audio/')) return '🎵';
  if (contentType.includes('pdf')) return '📄';
  if (contentType.includes('word') || contentType.includes('document')) return '📝';
  if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊';
  if (contentType.includes('presentation') || contentType.includes('powerpoint')) return '📽️';
  return '📎';
};

// Preview file
export const previewFile = (url: string, contentType: string): void => {
  if (contentType.startsWith('image/') || 
      contentType.startsWith('video/') || 
      contentType.startsWith('audio/') || 
      contentType.includes('pdf')) {
    window.open(url, '_blank');
  } else {
    // For other file types, just download
    downloadFile(url);
  }
};

// Download file
export const downloadFile = (url: string): void => {
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

// Upload attachments
export const uploadAttachments = async (taskId: string, files: File[]): Promise<Attachment[]> => {
  if (!taskId || files.length === 0) {
    throw new Error('Task ID and files are required');
  }
  
  const formData = new FormData();
  formData.append('taskId', taskId);
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload files');
  }
  
  const data = await response.json();
  return data.attachments;
};

// Delete attachment
export const deleteAttachment = async (attachmentId: string, key: string): Promise<void> => {
  const response = await fetch(`/api/upload/${attachmentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete file');
  }
}; 