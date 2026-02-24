import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { AIChatbot } from "@/components/kanban/AIChatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <KanbanBoard />
      <AIChatbot />
    </div>
  );
};

export default Index;
