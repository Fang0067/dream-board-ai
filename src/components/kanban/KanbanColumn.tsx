import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import type { Task, Status } from "@/types/kanban";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  id: Status;
  title: string;
  tasks: Task[];
  onAddTask: (status: Status) => void;
}

export function KanbanColumn({ id, title, tasks, onAddTask }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] w-[300px] shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-kanban-column-header">{title}</h3>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(id)}
          className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 rounded-xl p-2.5 min-h-[200px] transition-colors duration-200 ${
              snapshot.isDraggingOver
                ? "bg-accent/60 border-2 border-dashed border-primary/30"
                : "bg-kanban-column"
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex items-center justify-center h-24 text-xs text-muted-foreground/60">
                Drop tasks here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
