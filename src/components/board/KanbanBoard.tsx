import { useMemo, useState } from "react";
import { useKanbanStore } from "../../store/useKanbanStore";
import type { Column, Task } from "../../types/kanban";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { createPortal } from "react-dom";
import KanbanColumn from "./KanbanColumn";
import TaskCard from "./TaskCard";

export default function KanbanBoard() {
  const { columns, tasks, addColumn, moveColumn, moveTask } = useKanbanStore();

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const columnIds = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
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
                tasks={tasks.filter((task) => task.columnId === col.id)}
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
                  tasks={tasks.filter((t) => t.columnId === activeColumn.id)}
                />
              )}
              {activeTask && <TaskCard task={activeTask} />}
            </DragOverlay>,
            document.body,
          )}
        </div>
      </DndContext>
    </div>
  );
}
