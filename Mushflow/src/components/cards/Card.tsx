"use client";
import React, { useState } from "react";
import { Pin, CheckCircle, Calendar } from "lucide-react";
import { format } from "date-fns"; 

function Card({ title, content, priority, color, pinned, completed, dueDate }: any) {
  const [isPinned, setIsPinned] = useState(pinned);
  const [isCompleted, setIsCompleted] = useState(completed);

  return (
    <div
      className={`relative p-4 rounded-lg border border-gray-600 hover:shadow-lg transition-shadow ${color} group`}
    >
      <div className="flex justify-between items-start">
        <h3 className={`font-medium text-lg text-gray-100 ${isCompleted ? "line-through opacity-60" : ""}`}>
          {title}
        </h3>

        <button
          className={`opacity-0 group-hover:opacity-100 transition-opacity ease-in-out ${
            isPinned ? "text-yellow-100" : "text-gray-400"
          }`}
          onClick={() => setIsPinned(!isPinned)}
        >
          <Pin fill={isPinned ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-2 text-gray-300">
        {content.map((item: string, index: number) => (
          <p key={index} className="mb-1">• {item}</p>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 ">
        <button
          className={`flex items-center gap-1 ${
            isCompleted ? "text-green-400" : "text-gray-400"
          }`}
          onClick={() => setIsCompleted(!isCompleted)}
        >
          <CheckCircle fill={isCompleted ? "currentColor" : "none"} />
          <span className="text-sm">{isCompleted ? "Completed" : "Mark as Done"}</span>
        </button>

        {dueDate && (
          <div className="flex items-center gap-1 text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity ease-in-out">
            <Calendar size={14} />
            <span className="text-sm">{format(new Date(dueDate), "dd MMM, yyyy")}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;
