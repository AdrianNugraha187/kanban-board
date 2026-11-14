import { useKanbanStore } from "../../store/useKanbanStore";
import type { Task } from "../../types/kanban";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";

interface TaskCardProps {
  task: Task;
  isDragDisabled?: boolean;
}

export default function TaskCard({ task, isDragDisabled }: TaskCardProps) {
  const { deleteTask, updateTask } = useKanbanStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);

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
    disabled: isEditing || isDragDisabled,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  function handleSave() {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== task.content) {
      updateTask(task.id, trimmed);
    } else {
      setEditContent(task.content);
    }
    setIsEditing(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSave();
    } else if (event.key === "Escape") {
      setEditContent(task.content);
      setIsEditing(false);
    }
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-18 w-full rounded-lg border-2 border-dashed border-blue-500 bg-slate-800/50 opacity-50"
      />
    );
  }

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="min-h-18 rounded-lg border border-blue-500 bg-slate-800 p-2.5 shadow-md"
      >
        <textarea
          autoFocus
          rows={3}
          value={editContent}
          onChange={(event) => setEditContent(event.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          onFocus={(event) => {
            // Pindahkan kursor ke akhir teks saat mulai mengedit
            const val = event.target.value;
            event.target.value = "";
            event.target.value = val;
          }}
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-slate-100 focus:outline-none"
        />
      </div>
    );
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onDoubleClick={() => {
        setEditContent(task.content);
        setIsEditing(true);
      }}
      className={`group relative flex min-h-18 items-start justify-between rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-slate-100 shadow-sm transition-colors hover:border-blue-500  
        ${isDragDisabled ? `cursor-default` : `cursor-grab active:cursor-grabbing`} `}
    >
      <p className="w-full whitespace-pre-wrap wrap-break-words pr-6 leading-relaxed">
        {task.content}
      </p>

      {/* Tombol Edit & Hapus */}
      <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setEditContent(task.content);
            setIsEditing(true);
          }}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-blue-400"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Tugas
        </button>

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
    </div>
  );
}
