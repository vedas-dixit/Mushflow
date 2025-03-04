import { CreateTaskInput, Task } from '@/types/Task';

/**
 * Save a task to the database
 */
export async function saveTask(taskData: CreateTaskInput): Promise<Task> {
  console.log('Saving task:', taskData);
  
  try {
    const response = await fetch('/api/addTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from server:', errorData);
      throw new Error(errorData.error || `Failed to save task: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Task saved successfully:', data.task);
    return data.task;
  } catch (error) {
    console.error('Error saving task:', error);
    // For development with mock data, create a fake successful response
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      console.log('Creating mock task response for development');
      const mockTask: Task = {
        id: `mock-${Date.now()}`,
        userId: taskData.userId,
        title: taskData.title,
        content: taskData.content || '',
        priority: taskData.priority || 'medium',
        labels: taskData.labels || [],
        dueDate: taskData.dueDate || null,
        reminders: taskData.reminders || [],
        attachments: taskData.attachments || [],
        recurring: taskData.recurring || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: taskData.pinned || false,
        completed: taskData.completed || false,
      };
      return mockTask;
    }
    throw error;
  }
}

/**
 * Get tasks for a specific user
 */
export async function getTasks(userId: string): Promise<Task[]> {
  console.log('Fetching tasks for user:', userId);
  
  try {
    const response = await fetch(`/api/getTask?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from server:', errorData);
      throw new Error(errorData.error || `Failed to get tasks: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Retrieved ${data.tasks.length} tasks`);
    return data.tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
} 