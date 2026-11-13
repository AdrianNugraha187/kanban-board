import { create } from "zustand";
import type { Column, Id, Task } from "../types/kanban";
import { arrayMove } from "@dnd-kit/sortable";
import { persist } from "zustand/middleware";

interface KanbanState {
  columns: Column[];
  tasks: Task[];
  addColumn: (title: string) => void;
  deleteColumn: (id: Id) => void;
  addTask: (columnId: Id, content: string) => void;
  deleteTask: (id: Id) => void;
  moveColumn: (activeId: Id, overId: Id) => void;
  moveTask: (activeId: Id, overId: Id, isOverColumn: boolean) => void;
  resetBoard: () => void; //Opsional: untuk mengembalikan ke data awal
}

const initialColumns: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "doing", title: "In Progress" },
  { id: "done", title: "Done" },
];

const initialTasks: Task[] = [
  { id: "1", columnId: "todo", content: "Setup arsitektur folder" },
  { id: "2", columnId: "todo", content: "Buat interface TypeScript" },
  {
    id: "3",
    columnId: "doing",
    content: "Integrasi @dnd-kit dengan Zustand",
  },
];

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      columns: initialColumns,
      tasks: initialTasks,

      addColumn: (title: string) =>
        set((state) => ({
          columns: [...state.columns, { id: crypto.randomUUID(), title }],
        })),

      deleteColumn: (id) =>
        set((state) => ({
          columns: state.columns.filter((col) => col.id !== id),
          // Hapus juga semua kartu tugas yang berada di dalam kolom ini
          tasks: state.tasks.filter((t) => t.columnId !== id),
        })),

      addTask: (columnId: Id, content: string) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { id: crypto.randomUUID(), columnId, content },
          ],
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      moveColumn: (activeId, overId) =>
        set((state) => {
          const oldIndex = state.columns.findIndex(
            (col) => col.id === activeId,
          );
          const newIndex = state.columns.findIndex((col) => col.id === overId);
          return { columns: arrayMove(state.columns, oldIndex, newIndex) };
        }),

      moveTask: (activeId, overId, isOverColumn) =>
        set((state) => {
          const activeIndex = state.tasks.findIndex((t) => t.id === activeId);
          if (activeIndex === -1) return state;

          const updatedTask = [...state.tasks];

          if (isOverColumn) {
            updatedTask[activeIndex] = {
              ...updatedTask[activeIndex],
              columnId: overId,
            };
            return { tasks: arrayMove(updatedTask, activeIndex, activeIndex) };
          }

          const overIndex = state.tasks.findIndex((t) => t.id === overId);
          if (overIndex === -1) return state;

          if (
            updatedTask[activeIndex].columnId !==
            updatedTask[overIndex].columnId
          ) {
            updatedTask[activeIndex] = {
              ...updatedTask[activeIndex],
              columnId: updatedTask[overIndex].columnId,
            };
          }

          return { tasks: arrayMove(updatedTask, activeIndex, overIndex) };
        }),

      resetBoard: () =>
        set({
          columns: initialColumns,
          tasks: initialTasks,
        }),
    }),
    {
      name: "kanban-board-storage",
      partialize(state) {
        return {
          columns: state.columns,
          tasks: state.tasks,
        };
      },
    },
  ),
);

/*
export const useKanbanStore = create<KanbanState>((set) => ({
  columns: [
    { id: "todo", title: "To Do" },
    { id: "doing", title: "In Progress" },
    { id: "done", title: "Done" },
  ],
  tasks: [
    { id: "1", columnId: "todo", content: "Setup arsitektur folder" },
    { id: "2", columnId: "todo", content: "Buat interface TypeScript" },
    {
      id: "3",
      columnId: "doing",
      content: "Integrasi @dnd-kit dengan Zustand",
    },
  ],

  addColumn: (title: string) =>
    set((state) => ({
      columns: [...state.columns, { id: crypto.randomUUID(), title }],
    })),

  addTask: (columnId: Id, content: string) =>
    set((state) => ({
      tasks: [...state.tasks, { id: crypto.randomUUID(), columnId, content }],
    })),

  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  moveColumn: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.columns.findIndex((col) => col.id === activeId);
      const newIndex = state.columns.findIndex((col) => col.id === overId);
      return { columns: arrayMove(state.columns, oldIndex, newIndex) };
    }),

  moveTask: (activeId, overId, isOverColumn) =>
    set((state) => {
      const activeIndex = state.tasks.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return state;

      const updatedTask = [...state.tasks];

      if (isOverColumn) {
        updatedTask[activeIndex] = {
          ...updatedTask[activeIndex],
          columnId: overId,
        };
        return { tasks: arrayMove(updatedTask, activeIndex, activeIndex) };
      }

      const overIndex = state.tasks.findIndex((t) => t.id === overId);
      if (overIndex === -1) return state;

      if (
        updatedTask[activeIndex].columnId !== updatedTask[overIndex].columnId
      ) {
        updatedTask[activeIndex] = {
          ...updatedTask[activeIndex],
          columnId: updatedTask[overIndex].columnId,
        };
      }

      return { tasks: arrayMove(updatedTask, activeIndex, overIndex) };
    }),
}));
*/
