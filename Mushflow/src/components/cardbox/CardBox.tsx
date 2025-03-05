"use client";

import Card from "../cards/Card";
import { Task } from "@/types/Task";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface CardBoxProps {
  tasks: Task[];
}

function CardBox({ tasks: initialTasks }: CardBoxProps) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  
  // Update tasks when initialTasks changes
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);
  
  // Handle task update
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };
  
  // Handle task deletion
  const handleTaskDelete = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  
  console.log(`Rendering ${tasks.length} tasks`);
  
  // Get the current user ID
  const userId = session?.user?.id || "";
  
  return (
    !tasks.length ? 
    <div className="w-full h-full flex justify-center items-center text-gray-400">
      Add your first task
    </div> 
    : 
    <div className="w-full h-full pl-16 px-4 mt-28 flex justify-center">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
        {tasks.map((task) => {
          // Ensure task has an ID and userId
          if (!task.id) {
            console.warn("Task missing ID:", task);
            return null;
          }
          
          // Use task.userId if available, otherwise use the current user's ID
          const taskUserId = task.userId || userId;
          
          if (!taskUserId) {
            console.warn("Task missing userId and no session user ID available:", task);
            return null;
          }
          
          return (
            <div key={task.id} className="break-inside-avoid">
              <Card
                id={task.id}
                userId={taskUserId}
                title={task.title}
                content={task.content}
                priority={task.priority}
                color="bg-neutral-800"
                pinned={task.pinned}
                completed={task.completed}
                dueDate={task.dueDate}
                labels={task.labels}
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CardBox;