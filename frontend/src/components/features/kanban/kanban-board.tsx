'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import type {
  ApplicationListItem,
  ApplicationStage,
} from '@/types/application';
import { APPLICATION_STAGES } from '@/types/application';
import { useApplicationStore } from '@/store/applications';

interface KanbanBoardProps {
  applications: ApplicationListItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (application: ApplicationListItem) => void;
  onDelete: (application: ApplicationListItem) => void;
  onOpenDetail: (application: ApplicationListItem) => void;
}

export function KanbanBoard({
  applications,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
  onOpenDetail,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const updateApplicationStage = useApplicationStore((s) => s.updateApplicationStage);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    })
  );

  const grouped = useMemo(() => {
    const map = new Map<ApplicationStage, ApplicationListItem[]>();
    for (const stage of APPLICATION_STAGES) {
      map.set(stage, []);
    }
    for (const app of applications) {
      const existing = map.get(app.stage as ApplicationStage) || [];
      existing.push(app);
      map.set(app.stage as ApplicationStage, existing);
    }
    return map;
  }, [applications]);

  const activeApplication = useMemo(
    () => (activeId ? applications.find((a) => a.id === activeId) : null),
    [applications, activeId]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const appId = active.id as string;
      const targetStage = over.id as ApplicationStage;

      const app = applications.find((a) => a.id === appId);
      if (!app || app.stage === targetStage) return;

      await updateApplicationStage(appId, { stage: targetStage });
    },
    [applications, updateApplicationStage]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory"
        style={{ maxHeight: 'calc(100vh - 280px)' }}
      >
        {APPLICATION_STAGES.map((stage) => (
          <div key={stage} className="snap-start shrink-0">
            <KanbanColumn
              stage={stage}
              applications={grouped.get(stage) || []}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpenDetail={onOpenDetail}
            />
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeApplication && (
          <div className="rotate-3 opacity-90">
            <KanbanCard
              application={activeApplication}
              isSelected={false}
              onToggleSelect={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
              onOpenDetail={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
