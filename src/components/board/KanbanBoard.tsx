import { useMemo, useState } from "react";
import { useKanbanStore } from "../../store/useKanbanStore";
import type { Column, Task } from "../../types/kanban";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Plus, Search, X } from "lucide-react";
import { createPortal } from "react-dom";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";

export default function KanbanBoard() {
  const { columns, tasks, addColumn, moveColumn, moveTask } = useKanbanStore();

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isFiltering = searchQuery.trim().length > 0;

  // Filter daftar tugas berdasarkan kata kunci (case-insensitive)
  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return tasks;
    return tasks.filter((task) => task.content.toLowerCase().includes(query));
  }, [tasks, searchQuery]);

  const columnIds = useMemo(() => columns.map((col) => col.id), [columns]);

  // 3. Daftarkan PointerSensor dan KeyboardSensor bersamaan
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragStart(event: DragStartEvent) {
    const { active } = event;

    if (active.data.current?.type === "Column") {
      setActiveColumn(active.data.current.column);
      return;
    }
    if (active.data.current?.type === "Task") {
      setActiveTask(active.data.current.task);
      return;
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    if (!isActiveTask) return;

    const isOverATask = over.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";

    if (isOverATask) {
      moveTask(activeId, overId, false);
    }

    if (isOverAColumn) {
      moveTask(activeId, overId, true);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    if (isActiveAColumn) {
      moveColumn(activeId, overId);
    }
  }

  function handleCreateColumn() {
    const title = window.prompt("Masukkan nama kolom baru");

    if (title?.trim()) {
      addColumn(title.trim());
    }
  }
  return (
    <div className="flex min-h-screen w-full items-start overflow-x-auto bg-slate-950 p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/60 px-8 py-4">
        <h1 className="text-lg font-bold text-slate-100">Kanban Board</h1>

        <div className="flex items-center gap-3">
          {isFiltering && (
            <span className="text-xs text-amber-400">
              Mode filter aktif (drag kartu terkuncu)
            </span>
          )}

          <div className="relative w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 py-1.5 pl-9 pr-8 text-sm text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
            {isFiltering && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-100"
                title="Bersihkan pencarian"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Area Papan Kanban */}
      <main>
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex items-start gap-6">
            <SortableContext items={columnIds}>
              {columns.map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={filteredTasks.filter(
                    (task) => task.columnId === col.id,
                  )}
                  isDragDisabled={isFiltering}
                />
              ))}
            </SortableContext>

            <button
              type="button"
              onClick={handleCreateColumn}
              className="flex h-14 w-80 shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 text-sm font-medium text-slate-400 transition-colors hover:border-blue-500 hover:text-slate-100"
            >
              <Plus className="h-5 w-5" />
              Tambah Kolom
            </button>

            {/* Portal agar elemen yang ditarik tidak terpotong container overflow */}
            {createPortal(
              <DragOverlay>
                {activeColumn && (
                  <KanbanColumn
                    column={activeColumn}
                    tasks={filteredTasks.filter(
                      (t) => t.columnId === activeColumn.id,
                    )}
                  />
                )}
                {activeTask && <TaskCard task={activeTask} />}
              </DragOverlay>,
              document.body,
            )}
          </div>
        </DndContext>
      </main>
    </div>
  );
}
