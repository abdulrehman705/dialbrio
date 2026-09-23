"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

export type { ColumnDef } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "right" | "center";
    className?: string;
    /** Hide below this breakpoint when not rendering mobile cards. */
    hideBelow?: "md" | "lg" | "xl";
  }
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  empty?: React.ReactNode;
  /** Render rows as stacked cards below `md` (docs/design.md §17). */
  mobileCard?: (row: T) => React.ReactNode;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (s: RowSelectionState) => void;
  selectedRowId?: string;
  density?: "comfortable" | "compact";
  caption: string;
  className?: string;
  manualSorting?: boolean;
}

const hideClass = { md: "max-md:hidden", lg: "max-lg:hidden", xl: "max-xl:hidden" };

export function DataTable<T>({
  data,
  columns,
  getRowId,
  onRowClick,
  loading,
  empty,
  mobileCard,
  rowSelection,
  onRowSelectionChange,
  selectedRowId,
  density = "comfortable",
  caption,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting, rowSelection: rowSelection ?? {} },
    enableRowSelection: !!onRowSelectionChange,
    onRowSelectionChange: (u) => onRowSelectionChange?.(typeof u === "function" ? u(rowSelection ?? {}) : u),
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rowH = density === "compact" ? "h-9" : "h-11";

  if (!loading && data.length === 0) return <>{empty}</>;

  return (
    <div className={className}>
      {mobileCard && (
        <ul className="divide-y divide-border md:hidden" aria-label={caption}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="p-4">
                  <Skeleton className="mb-2 h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </li>
              ))
            : table.getRowModel().rows.map((row) => (
                <li key={row.id}>
                  {onRowClick ? (
                    <button type="button" className="block w-full p-4 text-left hover:bg-surface-hover" onClick={() => onRowClick(row.original)}>
                      {mobileCard(row.original)}
                    </button>
                  ) : (
                    <div className="p-4">{mobileCard(row.original)}</div>
                  )}
                </li>
              ))}
        </ul>
      )}
      <div className={cn("overflow-x-auto", mobileCard && "max-md:hidden")}>
        <table className="w-full border-separate border-spacing-0 text-[13px]">
          <caption className="sr-only">{caption}</caption>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const sortable = header.column.getCanSort() && header.column.columnDef.enableSorting !== false && !!header.column.accessorFn;
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                      className={cn(
                        "sticky top-0 z-[1] h-9 border-b border-border bg-surface-sunken px-3 text-xs font-medium whitespace-nowrap text-fg-muted first:pl-4 last:pr-4",
                        meta?.align === "right" ? "text-right" : meta?.align === "center" ? "text-center" : "text-left",
                        meta?.hideBelow && hideClass[meta.hideBelow],
                        meta?.className,
                      )}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : sortable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn("inline-flex items-center gap-1 hover:text-fg", meta?.align === "right" && "flex-row-reverse")}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? <ArrowUp className="size-3" /> : sorted === "desc" ? <ArrowDown className="size-3" /> : <ChevronsUpDown className="size-3 opacity-50" />}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((c, j) => (
                      <td key={j} className={cn(rowH, "border-b border-border px-3 first:pl-4 last:pr-4", c.meta?.hideBelow && hideClass[c.meta.hideBelow])}>
                        <Skeleton className="h-3.5 w-full max-w-32" />
                      </td>
                    ))}
                  </tr>
                ))
              : table.getRowModel().rows.map((row) => {
                  const selected = row.getIsSelected() || row.id === selectedRowId;
                  return (
                    <tr
                      key={row.id}
                      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                      onKeyDown={
                        onRowClick
                          ? (e) => {
                              if (e.key === "Enter" && e.target === e.currentTarget) onRowClick(row.original);
                            }
                          : undefined
                      }
                      tabIndex={onRowClick ? 0 : undefined}
                      aria-selected={selected || undefined}
                      className={cn(
                        "group transition-colors duration-(--duration-fast)",
                        onRowClick && "cursor-pointer hover:bg-surface-hover focus-visible:-outline-offset-2",
                        selected && "bg-brand-soft hover:bg-brand-soft",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta;
                        return (
                          <td
                            key={cell.id}
                            className={cn(
                              rowH,
                              "border-b border-border px-3 whitespace-nowrap text-fg-secondary first:pl-4 last:pr-4",
                              meta?.align === "right" ? "text-right tabular" : meta?.align === "center" ? "text-center" : "text-left",
                              meta?.hideBelow && hideClass[meta.hideBelow],
                              meta?.className,
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
