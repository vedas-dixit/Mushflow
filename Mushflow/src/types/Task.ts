export interface Task {
  // Database keys
  PK?: string;
  SK?: string;
  GSI1PK?: string;
  GSI1SK?: string;
  
  // Core data
  id: string;
  userId: string;
  title: string;
  content: string;
  
  // Task metadata
  priority: "low" | "medium" | "high";
  labels: string[];
  dueDate: string | null;
  reminders: string[];
  attachments: string[];
  recurring: string | null;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Status flags
  pinned: boolean;
  completed: boolean;
}

export interface CreateTaskInput {
  userId: string;
  title: string;
  content: string;
  priority?: "low" | "medium" | "high";
  labels?: string[];
  dueDate?: string | null;
  reminders?: string[];
  attachments?: string[];
  recurring?: string | null;
  pinned?: boolean;
  completed?: boolean;
}

export type TaskPriority = "low" | "medium" | "high";

export interface Label {
  id: string;
  name: string;
  color: string;
  icon?: string;
  userId: string;
  isSystem: boolean;
} 