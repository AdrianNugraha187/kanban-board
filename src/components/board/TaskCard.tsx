import { useKanbanStore } from "../../store/useKanbanStore";
import type { Task } from "../../types/kanban";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const deleteTask = useKanbanStore((state) => state.deleteTask);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[72px] w-full rounded-lg border-2 border-dashed border-blue-500 bg-slate-800/50 opacity-50"
      />
    );
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative flex min-h-[72px] cursor-grab items-start justify-between rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-slate-100 shadow-sm transition-colors hover:border-blue-500 active:cursor-grabbing"
    >
      <p className="w-full whitespace-pre-wrap break-words pr-6 leading-relaxed">
        {task.content}
      </p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          deleteTask(task.id);
        }}
        className="absolute right-2 top-2 rounded p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-slate-700 hover:text-red-400 group-hover:opacity-100"
        title="Hapus Tugas"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
