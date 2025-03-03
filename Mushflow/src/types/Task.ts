export interface Task {
  id: string;
  userId: string;
  title: string;
  content: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  completed: boolean;
}

export interface CreateTaskInput {
  userId: string;
  title: string;
  content: string;
  dueDate: string | null;
  pinned?: boolean;
  completed?: boolean;
} 