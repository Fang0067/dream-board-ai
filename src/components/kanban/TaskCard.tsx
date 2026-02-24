import { Draggable } from "@hello-pangea/dnd";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import type { Task, PRIORITY_CONFIG } from "@/types/kanban";

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-priority-low/15 text-accent-foreground",
  medium: "bg-priority-medium/15 text-priority-medium",
  high: "bg-priority-high/15 text-priority-high",
  urgent: "bg-priority-urgent/15 text-priority-urgent",
};

const PRIORITY_DOT: Record<string, string> = {
  low: "bg-priority-low",
  medium: "bg-priority-medium",
  high: "bg-priority-high",
  urgent: "bg-priority-urgent",
};

interface TaskCardProps {
  task: Task;
  index: number;
}

export function TaskCard({ task, index }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-card rounded-lg p-3.5 mb-2.5 cursor-grab active:cursor-grabbing transition-all duration-200 border border-border ${
            snapshot.isDragging
              ? "shadow-elevated rotate-[2deg] scale-[1.02]"
              : "shadow-task-card hover:shadow-task-card-hover"
          }`}
        >
          {/* Priority badge */}
          <div className="flex items-center justify-between mb-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority]}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-card-foreground mb-1 leading-snug">
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {task.due_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(task.due_date), "MMM d")}
              </span>
            )}
            {task.assignee && (
              <span className="flex items-center gap-1 ml-auto">
                <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </span>
                <span className="text-xs">{task.assignee}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
