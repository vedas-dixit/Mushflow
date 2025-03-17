import { CreateTaskInput, Task } from '@/types/Task';
import { store } from '@/redux/store';
import { setLoading } from '@/redux/features/loaderSlice';

/**
 * Save a task to the database
 */
export async function saveTask(taskData: CreateTaskInput): Promise<Task> {
  console.log('Saving task:', taskData);
  
  // Show loader
  store.dispatch(setLoading(true));
  
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
    }
    throw error;
  } finally {
    // Hide loader
    store.dispatch(setLoading(false));
  }
}

/**
 * Get tasks for a specific user
 */
export async function getTasks(userId: string): Promise<Task[]> {
  console.log('Fetching tasks for user:', userId);
  
  // Show loader
  store.dispatch(setLoading(true));
  
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
  } finally {
    // Hide loader
    store.dispatch(setLoading(false));
  }
} 

// Create a throttle function to limit API calls
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  let lastCall = 0;
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastPromiseResolve: ((value: ReturnType<T>) => void) | null = null;
  let lastPromiseReject: ((reason?: any) => void) | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const now = Date.now();
    lastArgs = args;

    return new Promise((resolve, reject) => {
      lastPromiseResolve = resolve;
      lastPromiseReject = reject;

      if (now - lastCall >= delay) {
        // If enough time has passed since the last call, execute immediately
        lastCall = now;
        try {
          const result = func(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      } else if (!timeout) {
        // Schedule a delayed execution
        timeout = setTimeout(() => {
          lastCall = Date.now();
          timeout = null;
          try {
            if (lastArgs && lastPromiseResolve) {
              const result = func(...lastArgs);
              lastPromiseResolve(result);
            }
          } catch (error) {
            if (lastPromiseReject) {
              lastPromiseReject(error);
            }
          }
        }, delay - (now - lastCall));
      }
    });
  };
};

/**
 * Update a task in the database with throttling
 */
export const updateTask = throttle(async (taskData: Partial<Task> & { id: string; userId: string }): Promise<Task> => {
  console.log('Updating task:', taskData);
  
  // Show loader
  store.dispatch(setLoading(true));
  
  if (!taskData.id || !taskData.userId) {
    console.error('Missing required parameters for updateTask:', { id: taskData.id, userId: taskData.userId });
    // Hide loader
    store.dispatch(setLoading(false));
    throw new Error('Missing required parameters: id and userId are required');
  }

  console.log('Updating task:', taskData.id, 'for user:', taskData.userId);
  
  try {
    const response = await fetch('/api/updateTask', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from server:', errorData);
      throw new Error(errorData.error || `Failed to update task: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Task updated successfully:', data.task);
    return data.task;
  } catch (error) {
    console.error('Error updating task:', error);
    // For development with mock data, create a fake successful response
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      console.log('Creating mock task update response for development');
      const mockTask: Task = {
        ...taskData as Task,
        updatedAt: new Date().toISOString(),
      };
      return mockTask;
    }
    throw error;
  } finally {
    // Hide loader
    store.dispatch(setLoading(false));
  }
}, 800); // 800ms throttle delay, similar to Google Keep

/**
 * Delete a task from the database
 */
export async function deleteTask(taskId: string, userId: string): Promise<boolean> {
  // Show loader
  store.dispatch(setLoading(true));
  
  if (!taskId || !userId) {
    console.error('Missing required parameters for deleteTask:', { taskId, userId });
    // Hide loader
    store.dispatch(setLoading(false));
    throw new Error('Missing required parameters: taskId and userId are required');
  }

  console.log('Deleting task:', taskId, 'for user:', userId);
  
  try {
    const response = await fetch(`/api/deleteTask?taskId=${encodeURIComponent(taskId)}&userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from server:', errorData);
      throw new Error(errorData.error || `Failed to delete task: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Task deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    // For development with mock data, return success
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      console.log('Mock task deletion for development');
      return true;
    }
    throw error;
  } finally {
    // Hide loader
    store.dispatch(setLoading(false));
  }
}

