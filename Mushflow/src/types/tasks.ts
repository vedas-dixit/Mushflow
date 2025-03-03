export interface Task {
    userId: string;
    dataId: string;
    title: string;
    content: string;
    priority: "low" | "mid" | "high";
    color: string;
    pinned: boolean;
    completed: boolean;
    dueDate: string | null;
    createdAt: string;
  }
  
  