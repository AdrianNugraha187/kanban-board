import React, { useMemo, useState } from "react";
import type { Column, Task } from "../../types/kanban";
import { useKanbanStore } from "../../store/useKanbanStore";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import { Plus, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  isDragDisabled?: boolean;
}

export default function KanbanColumn({
  column,
  tasks,
  isDragDisabled,
}: KanbanColumnProps) {
  const { addTask, updateColumn, deleteColumn } = useKanbanStore();

  // State untuk tambah tugas
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState("");

  // State untuk inline edit judul kolom
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteColumnClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    // Langsung hapus jika kolom kosong
    if (tasks.length === 0) {
      deleteColumn(column.id);
      return;
    }

    // Buka modal konfirmasi jika masih ada tugas di dalamnya
    setIsDeleteModalOpen(true);
  };

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
    disabled: isEditingTitle,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  function handleSaveTitle() {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== column.title) {
      updateColumn(column.id, trimmed);
    } else {
      setIsEditingTitle(false);
    }
  }

  function handleTitleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSaveTitle();
    } else if (event.key === "Escape") {
      setEditTitle(column.title);
      setIsEditingTitle(false);
    }
  }

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
        className="flex h-130 w-80 shrink-0 flex-col rounded-xl border-2 border-dashed border-blue-500 bg-slate-900/40"
      />
    );
  }

  // function handleDeleteColumn(event: React.MouseEvent) {
  //   event.stopPropagation();

  //   // Jika kolom masih memiliki tugas, minta konfirmasi pengguna
  //   if (tasks.length > 0) {
  //     const confirmed = window.confirm(
  //       `Kolom "${column.title}" masih memiliki ${tasks.length} tugas. Apakah anda Yakin ingin menghapus kolom beserta seluruh tugas di dalamnya?`,
  //     );

  //     if (!confirmed) return;
  //   }

  //   deleteColumn(column.id);
  // }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="flex h-130 w-80 shrink-0 flex-col rounded-xl border border-slate-800 bg-slate-900 shadow-md"
      >
        {/* Header Kolom: Tambahkan class 'group' dan masukkan tombol hapus ke dalam header */}
        <header
          {...attributes}
          {...listeners}
          className="group flex cursor-grab items-center justify-between border-b border-slate-800 p-4 e:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 active:cursor-grabbing"
        >
          <button
            type="button"
            onClick={handleDeleteColumnClick}
            className="shrink-0 rounded p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-slate-800 hover:text-red-400 group-hover:opacity-100 focus:opacity-100"
            title={`Hapus kolom ${column.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            {isEditingTitle ? (
              <input
                autoFocus
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  handleTitleKeyDown(e);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded border border-blue-500 bg-slate-800 px-2 py-0.5 text-sm font-semibold text-slate-100 focus:outline-none"
              />
            ) : (
              <h3
                onClick={(e) => {
                  e.stopPropagation();
                  setEditTitle(column.title);
                  setIsEditingTitle(true);
                }}
                title="Klik untuk mengganti nama kolom"
                className="cursor-text truncate rounded px-1 py-0.5 font-semibold text-slate-100 hover:bg-slate-800"
              >
                {column.title}
              </h3>
            )}
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
              {tasks.length}
            </span>
          </div>

          {/* <button
            type="button"
            onClick={handleDeleteColumn}
            className="rounded p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-slate-800 hover:text-red-400 group-hover:opacity-100 focus:opacity-100"
            title={`Hapus kolom ${column.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button> */}
        </header>
        {/* Pada bagian render daftar kartu tugas: */}
        {/* Daftar Kartu Tugas */}
        <section className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
          <SortableContext items={taskIds}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                isDragDisabled={isDragDisabled}
                task={task}
              />
            ))}
          </SortableContext>

          {tasks.length === 0 && isDragDisabled && (
            <p className="py-8 text-center text-xs text-slate-500">
              Tidak ada tugas yang ditemukan
            </p>
          )}
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

        {/* Modal Konfirmasi Hapus Kolom */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Hapus Kolom"
        >
          <div className="flex flex-col gap-5">
            <p className="text-sm leading-relaxed text-slate-300">
              Kolom{" "}
              <span className="font-semibold text-slate-100">
                "{column.title}"
              </span>{" "}
              masih memiliki{" "}
              <span className="font-semibold text-red-400">
                {tasks.length} tugas
              </span>
              . Tindakan ini akan menghapus kolom beserta seluruh tugas di
              dalamnya secara permanen.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteColumn(column.id);
                  setIsDeleteModalOpen(false);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
              >
                Ya, Hapus Kolom
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
