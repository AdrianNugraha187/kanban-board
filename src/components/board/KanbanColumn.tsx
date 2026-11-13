import React, { useMemo, useState } from "react";
import type { Column, Task } from "../../types/kanban";
import { useKanbanStore } from "../../store/useKanbanStore";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import { Plus, Trash2 } from "lucide-react";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
}

export default function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const addTask = useKanbanStore((state) => state.addTask);
  const deleteColumn = useKanbanStore((state) => state.deleteColumn);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState("");

  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const {
    setNodeRef,
    attributes,
    transform,
    transition,
    listeners,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskContent.trim()) return;
    addTask(column.id, newTaskContent.trim());
    setIsAdding(false);
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex h-[520px] w-80 shrink-0 flex-col rounded-xl border-2 border-dashed border-blue-500 bg-slate-900/40"
      />
    );
  }

  function handleDeleteColumn(event: React.MouseEvent) {
    event.stopPropagation();

    // Jika kolom masih memiliki tugas, minta konfirmasi pengguna
    if (tasks.length > 0) {
      const confirmed = window.confirm(
        `Kolom "${column.title}" masih memiliki ${tasks.length} tugas. Apakah anda Yakin ingin menghapus kolom beserta seluruh tugas di dalamnya?`,
      );

      if (!confirmed) return;
    }

    deleteColumn(column.id);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex h-[520px] w-80 shrink-0 flex-col rounded-xl border border-slate-800 bg-slate-900 shadow-md"
    >
      {/* Header Kolom: Tambahkan class 'group' dan masukkan tombol hapus ke dalam header */}
      <header
        {...attributes}
        {...listeners}
        className="group flex cursor-grab items-center justify-between border-b border-slate-800 p-4 active:cursor-grabbing"
      >
        <div className="flex items-center gap-2.5">
          <h3 className="font-semibold text-slate-100">{column.title}</h3>
          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={handleDeleteColumn}
          className="rounded p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-slate-800 hover:text-red-400 group-hover:opacity-100 focus:opacity-100"
          title={`Hapus kolom ${column.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </header>

      {/* Daftar Kartu Tugas */}
      <section className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </section>

      {/* Footer: Form / Tombol Tambah Tugas */}
      <footer className="border-t border-slate-800 p-3">
        {isAdding ? (
          <form onSubmit={handleAddTask} className="flex flex-col gap-2">
            <textarea
              autoFocus
              rows={2}
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddTask(e);
                }
              }}
              placeholder="Tulis Deskripsi Tugas"
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-sm text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskContent("");
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                Batal
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center gap-2 rounded-lg p-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            <Plus className="h-4 w-4" />
            Tambah Tugas
          </button>
        )}
      </footer>
    </div>
  );
}
