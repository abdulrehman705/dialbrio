"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, GripVertical, ListOrdered } from "lucide-react";
import { toast } from "sonner";
import type { DialQueue } from "@dialbrio/types";
import { LEAD_STATE_META } from "@/components/domain";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
import { EmptyState, ErrorState } from "@/components/states";
import { useReorderQueues, useUpdateQueue } from "@/lib/queries";
import { cn, formatNumber } from "@/lib/utils";
import { formatMinutes, formatWindow, slaMinutes } from "./utils";

interface QueueListProps {
  queues?: DialQueue[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** Priority-ordered queues. Drag (pointer or keyboard) to change dialing priority. */
export function QueueList({ queues, loading, error, onRetry, selectedId, onSelect }: QueueListProps) {
  const reorder = useReorderQueues();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ordered = React.useMemo(() => [...(queues ?? [])].sort((a, b) => a.priority - b.priority), [queues]);

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = ordered.map((q) => q.id);
    const next = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    const moved = ordered.find((q) => q.id === active.id);
    reorder.mutate(next, {
      onSuccess: () => toast.success(`${moved?.name} is now priority ${next.indexOf(String(active.id)) + 1}`, { description: "Agents receive leads from higher-priority queues first." }),
      onError: () => toast.error("Couldn't save the new order", { description: "The previous order was restored." }),
    });
  }

  return (
    <Card>
      <CardHeader
        title="Smart prioritization"
        description="Agents get the next lead from the highest queue that has one ready. Inside a queue, leads are ranked by recency, source, engagement and past call outcomes. Drag queues to change their order."
      />
      <div className="hidden grid-cols-[28px_32px_minmax(0,1fr)_80px_140px_80px_minmax(0,210px)_52px] items-center gap-3 border-y border-border px-4 py-2 text-xs text-fg-muted xl:grid">
        <span className="sr-only">Reorder</span>
        <span>#</span>
        <span>Queue</span>
        <span className="text-right">Waiting</span>
        <span>Oldest vs target</span>
        <span className="text-right">Per hour</span>
        <span>Calling window</span>
        <span className="text-right">On</span>
      </div>
      {error ? (
        <ErrorState compact onRetry={onRetry} description="Queues could not be loaded." />
      ) : loading ? (
        <ul className="divide-y divide-border border-t border-border xl:border-t-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-4">
              <Skeleton className="size-6" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="ml-auto h-4 w-24" />
            </li>
          ))}
        </ul>
      ) : ordered.length === 0 ? (
        <EmptyState compact icon={ListOrdered} title="No queues yet" description="Queues are created when you launch a campaign. Start with a campaign to route leads here." />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          accessibility={{
            screenReaderInstructions: { draggable: "To reorder, press space or enter to pick up the queue, use the arrow keys to move it, then press space or enter to drop it." },
          }}
        >
          <SortableContext items={ordered.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            <ol className="divide-y divide-border border-t border-border xl:border-t-0" aria-label="Queues in priority order">
              {ordered.map((q, i) => (
                <QueueRow key={q.id} queue={q} position={i + 1} selected={q.id === selectedId} onSelect={() => onSelect(q.id)} />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </Card>
  );
}

function QueueRow({ queue: q, position, selected, onSelect }: { queue: DialQueue; position: number; selected: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: q.id });
  const update = useUpdateQueue();
  const sla = slaMinutes(q);
  const overSla = q.enabled && q.oldestWaitMinutes > sla;
  const slaRatio = Math.min(1, q.oldestWaitMinutes / sla);

  const toggle = (enabled: boolean) =>
    update.mutate(
      { id: q.id, patch: { enabled } },
      {
        onSuccess: () => toast.success(`${q.name} ${enabled ? "enabled" : "paused"}`, { description: enabled ? "Leads in this queue are eligible for dialing." : "Leads stay queued but won't be served to agents." }),
        onError: () => toast.error(`Couldn't update ${q.name}`),
      },
    );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative bg-surface transition-colors",
        isDragging && "z-10 shadow-lg ring-1 ring-border-strong",
        selected && "bg-surface-sunken",
        !q.enabled && "text-fg-muted",
      )}
    >
      <div
        className="grid cursor-pointer grid-cols-[28px_28px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 hover:bg-surface-hover xl:grid-cols-[28px_32px_minmax(0,1fr)_80px_140px_80px_minmax(0,210px)_52px]"
        onClick={onSelect}
      >
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${q.name}, currently priority ${position}`}
          onClick={(e) => e.stopPropagation()}
          className="flex size-7 cursor-grab touch-none items-center justify-center rounded-sm text-fg-muted hover:bg-surface-active hover:text-fg active:cursor-grabbing max-lg:size-10"
        >
          <GripVertical className="size-4" />
        </button>
        <span className="font-display text-lg font-bold text-fg-muted">{position}</span>

        <div className="min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="flex max-w-full items-center gap-1.5 rounded-sm text-left text-[13px] font-semibold text-fg"
            aria-label={`Open ${q.name} details`}
          >
            <span className="truncate">{q.name}</span>
            {!q.enabled && <span className="text-xs font-normal text-fg-muted">(paused)</span>}
            <ChevronRight className="size-3.5 shrink-0 text-fg-muted" aria-hidden />
          </button>
          <p className="mt-0.5 truncate text-xs text-fg-muted">
            {q.leadStates.map((s) => LEAD_STATE_META[s].label).join(", ")} leads from {q.sources.join(", ")}
          </p>
        </div>

        {/* Compact metrics (below xl) */}
        <div className="flex items-center gap-3 xl:hidden" onClick={(e) => e.stopPropagation()}>
          <span className="text-right text-xs text-fg-muted">
            <span className="block text-sm font-semibold text-fg tabular">{formatNumber(q.waiting)}</span>
            waiting
          </span>
          <Switch checked={q.enabled} onCheckedChange={toggle} disabled={update.isPending} aria-label={`${q.enabled ? "Pause" : "Enable"} ${q.name}`} />
        </div>
        <div className="col-span-2 col-start-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted xl:hidden">
          <span className={cn(overSla && "text-warning-text")}>
            Oldest {q.enabled ? formatMinutes(q.oldestWaitMinutes) : "–"}, target {formatMinutes(sla)}
          </span>
          <span className="font-mono">{q.throughputPerHour}/hr</span>
          <span>{formatWindow(q.callingWindow)}</span>
        </div>

        {/* Full metrics (xl+) */}
        <span className="hidden text-right font-mono text-sm text-fg xl:block">{formatNumber(q.waiting)}</span>
        <div className="hidden xl:block">
          {q.enabled ? (
            <Tooltip content={`Oldest lead has waited ${formatMinutes(q.oldestWaitMinutes)}. Target for this queue: ${formatMinutes(sla)}.`}>
              <div tabIndex={0} className="rounded-sm">
                <div className={cn("flex items-baseline justify-between text-xs tabular", overSla ? "font-medium text-warning-text" : "text-fg-secondary")}>
                  <span>{formatMinutes(q.oldestWaitMinutes)}</span>
                  <span className="text-fg-muted">/ {formatMinutes(sla)}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-active">
                  <div className={cn("h-full rounded-full", overSla ? "bg-warning" : "bg-success")} style={{ width: `${slaRatio * 100}%` }} />
                </div>
                {overSla && <span className="sr-only">Over target</span>}
              </div>
            </Tooltip>
          ) : (
            <span className="text-xs text-fg-muted">Paused</span>
          )}
        </div>
        <span className="hidden text-right font-mono text-[13px] text-fg-secondary xl:block">{q.throughputPerHour}</span>
        <span className="hidden truncate text-xs text-fg-muted xl:block">{formatWindow(q.callingWindow)}</span>
        <div className="hidden justify-end xl:flex" onClick={(e) => e.stopPropagation()}>
          <Switch checked={q.enabled} onCheckedChange={toggle} disabled={update.isPending} aria-label={`${q.enabled ? "Pause" : "Enable"} ${q.name}`} />
        </div>
      </div>
    </li>
  );
}
