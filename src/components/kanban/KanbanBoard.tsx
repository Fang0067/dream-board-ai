import { useState, useEffect, useCallback } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Plus, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Task, Status, Priority } from "@/types/kanban";
import { COLUMN_CONFIG } from "@/types/kanban";
import { KanbanColumn } from "./KanbanColumn";
import { AddTaskDialog } from "./AddTaskDialog";
import { Button } from "@/components/ui/button";

export function KanbanBoard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStatus, setDialogStatus] = useState<Status>("todo");
  const [loading, setLoading] = useState(true);

  // Load tasks from DB (user-scoped via RLS)
  useEffect(() => {
    if (!user?.id) return;

    const loadTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("position", { ascending: true });

      if (error) {
        console.error("Error loading tasks:", error);
        toast.error("Failed to load tasks");
      } else {
        setTasks((data as Task[]) || []);
      }
      setLoading(false);
    };

    loadTasks();
  }, [user?.id]);

  const openAddDialog = (status: Status) => {
    setDialogStatus(status);
    setDialogOpen(true);
  };

  const handleAddTask = async (taskData: {
    title: string;
    description: string;
    status: Status;
    priority: Priority;
    assignee: string;
    due_date: string | null;
  }) => {
    if (!user?.id) {
      toast.error("Please sign in to add tasks");
      return;
    }

    const columnTasks = tasks.filter((t) => t.status === taskData.status);
    const position = columnTasks.length;

    const { data, error } = await supabase
      .from("tasks")
      .insert({ ...taskData, position, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add task");
      console.error(error);
      return;
    }
    setTasks((prev) => [...prev, data as Task]);
    toast.success("Task added!");
  };

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      const newTasks = [...tasks];
      const taskIdx = newTasks.findIndex((t) => t.id === draggableId);
      if (taskIdx === -1) return;

      const [movedTask] = newTasks.splice(taskIdx, 1);
      movedTask.status = destination.droppableId as Status;

      // Get destination column tasks (without the moved task)
      const destTasks = newTasks.filter((t) => t.status === destination.droppableId);
      destTasks.splice(destination.index, 0, movedTask);

      // Reassign positions
      destTasks.forEach((t, i) => {
        t.position = i;
      });

      // Also reassign source column if different
      if (source.droppableId !== destination.droppableId) {
        const srcTasks = newTasks.filter((t) => t.status === source.droppableId);
        srcTasks.forEach((t, i) => {
          t.position = i;
        });
      }

      // Rebuild full task array
      const finalTasks = [
        ...newTasks.filter(
          (t) => t.status !== destination.droppableId && t.status !== source.droppableId
        ),
        ...destTasks,
        ...(source.droppableId !== destination.droppableId
          ? newTasks.filter((t) => t.status === source.droppableId)
          : []),
      ];
      setTasks(finalTasks);

      // Persist the moved task
      await supabase
        .from("tasks")
        .update({ status: movedTask.status, position: movedTask.position })
        .eq("id", movedTask.id);
    },
    [tasks]
  );

  const getColumnTasks = (status: Status) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div>
          <h1 className="text-xl font-bold text-foreground">Kanban Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => openAddDialog("todo")}
            size="sm"
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Task
          </Button>
          <Button
            onClick={signOut}
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-5 min-h-[calc(100vh-200px)]">
            {COLUMN_CONFIG.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={getColumnTasks(col.id)}
                onAddTask={openAddDialog}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      <AddTaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultStatus={dialogStatus}
        onAdd={handleAddTask}
      />
    </div>
  );
}
