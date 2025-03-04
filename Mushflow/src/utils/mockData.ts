import { Task } from '@/types/Task';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate mock tasks for development purposes
 * This is useful when DynamoDB is not configured
 */
export function generateMockTasks(userId: string, count: number = 5): Task[] {
  const now = new Date();
  const tasks: Task[] = [];
  
  const priorities: ("low" | "medium" | "high")[] = ['low', 'medium', 'high'];
  const titles = [
    'Complete project documentation',
    'Prepare for meeting',
    'Research new technologies',
    'Fix bugs in application',
    'Review pull requests',
    'Update dependencies',
    'Create presentation slides',
    'Schedule team meeting',
    'Respond to emails',
    'Plan next sprint'
  ];
  
  const contents = [
    ['Document API endpoints', 'Add examples', 'Review with team'],
    ['Prepare agenda', 'Gather materials', 'Send invites'],
    ['Look into new frameworks', 'Test performance', 'Share findings'],
    ['Address UI issues', 'Fix backend errors', 'Test thoroughly'],
    ['Review code quality', 'Check for security issues', 'Provide feedback'],
    ['Update npm packages', 'Test compatibility', 'Fix breaking changes'],
    ['Create outline', 'Add visuals', 'Practice delivery'],
    ['Find suitable time', 'Book meeting room', 'Prepare agenda'],
    ['Sort by priority', 'Draft responses', 'Follow up on pending items'],
    ['Identify goals', 'Assign tasks', 'Set deadlines']
  ];
  
  const labels = [
    ['work', 'important'],
    ['personal'],
    ['learning', 'work'],
    ['urgent', 'work'],
    ['work'],
    ['work', 'maintenance'],
    ['work', 'presentation'],
    ['work', 'team'],
    ['personal', 'communication'],
    ['work', 'planning']
  ];
  
  for (let i = 0; i < count; i++) {
    const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    const updatedAt = new Date(new Date(createdAt).getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString();
    
    // Random due date between now and 14 days in the future (some null)
    const dueDate = Math.random() > 0.3 
      ? new Date(now.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
      : null;
    
    const titleIndex = Math.floor(Math.random() * titles.length);
    
    tasks.push({
      id: uuidv4(),
      userId,
      title: titles[titleIndex],
      content: contents[titleIndex],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      labels: labels[titleIndex],
      dueDate,
      reminders: [],
      attachments: [],
      recurring: null,
      createdAt,
      updatedAt,
      pinned: Math.random() > 0.7,
      completed: Math.random() > 0.8,
    });
  }
  
  return tasks;
} 