"use client";

import Card from "../cards/Card";
import { Task } from "@/types/Task";

interface CardBoxProps {
  tasks: Task[];
}

function CardBox({ tasks }: CardBoxProps) {
  console.log(tasks.length);
  return (
    !tasks.length ? <>Add your first task</> : <div className="w-full h-full pl-16 px-4 mt-28 flex justify-center">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
        {tasks.map((task) => (
          <div key={task.id} className="break-inside-avoid">
            <Card
              title={task.title}
              content={task.content}
              priority={task.priority}
              color="bg-neutral-800"
              pinned={task.pinned}
              completed={task.completed}
              dueDate={task.dueDate}
              labels={task.labels}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardBox;