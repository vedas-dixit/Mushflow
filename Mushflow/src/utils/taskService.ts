import { CreateTaskInput, Task } from '@/types/Task';

/**
 * Save a task to the database
 */
export async function saveTask(taskData: CreateTaskInput): Promise<Task> {
  const response = await fetch('/api/addTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save task');
  }

  const data = await response.json();
  return data.task;
}

/**
 * Get tasks for a specific user
 */
export async function getTasks(userId: string): Promise<Task[]> {
  const response = await fetch(`/api/getTask?userId=${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get tasks');
  }

  const data = await response.json();
  return data.tasks;
} 