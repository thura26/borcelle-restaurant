import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Download, Trash2, CheckSquare, Square } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKeys = [],
  searchPlaceholder = "Search...",
  pageSize = 8,
  onExport,
  emptyText = "No data",
  filterSlot,
  hideSearch,
  isLoading,
  selectable,
  getRowId,
  selectedIds,
  onSelectionChange,
  onBulkDelete,
  bulkDeleteLabel = "Delete selected",
}: {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  pageSize?: number;
  onExport?: () => void;
  emptyText?: string;
  filterSlot?: React.ReactNode;
  hideSearch?: boolean;
  isLoading?: boolean;
  selectable?: boolean;
  getRowId?: (row: T) => string;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onBulkDelete?: (ids: string[]) => void;
  bulkDeleteLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query.trim() || searchKeys.length === 0) return data;
    const q = query.toLowerCase();
    return data.filter((row) => searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)));
  }, [data, query, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const { isDark } = useTheme();

  // reset page when query changes
  if (page !== currentPage) setTimeout(() => setPage(currentPage), 0);

  const getId = (row: T, idx: number) => (getRowId ? getRowId(row) : (row.id as string) ?? `row-${idx}`);
  const allIds = filtered.map((r, i) => getId(r, i));
  const isAllSelected = selectable && selectedIds ? allIds.length > 0 && allIds.every((id) => selectedIds.has(id)) : false;
  const isSomeSelected = selectable && selectedIds ? allIds.some((id) => selectedIds.has(id)) : false;

  const toggleAll = () => {
    if (!selectable || !onSelectionChange || !selectedIds) return;
    if (isAllSelected) {
      const next = new Set(selectedIds);
      allIds.forEach((id) => next.delete(id));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      allIds.forEach((id) => next.add(id));
      onSelectionChange(next);
    }
  };
  const toggleOne = (id: string) => {
    if (!selectable || !onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };



  if (isLoading) {
    return (
      <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-dark/5"}`}>
        <div className={`p-4 border-b ${isDark ? "border-white/10" : "border-dark/5"}`}>
          <div className={`h-10 rounded-full animate-pulse ${isDark ? "bg-white/10" : "bg-background"}`} />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-16 rounded-xl animate-pulse ${isDark ? "bg-white/5" : "bg-background/60"}`} style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-dark/5"}`}>
      {!hideSearch && (
        <div className={`p-4 flex flex-col md:flex-row gap-3 md:items-center justify-between border-b ${isDark ? "border-white/10" : "border-dark/5"}`}>
          <div className="relative flex-1 max-w-[360px]">
            <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/60" : "text-muted"}`} />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              className={`w-full pl-9 pr-4 py-2.5 rounded-full border-2 font-poppins text-sm outline-none placeholder:text-muted/60 ${isDark ? "bg-[#101010] border-white/10 text-white focus:border-primary/40" : "bg-background border-dark/10 focus:border-primary/30"}`}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {filterSlot}
            <span className={`font-poppins text-xs px-2 ${isDark ? "text-white/60" : "text-muted"}`}>{filtered.length} items</span>
            {onExport && (
              <button onClick={onExport} className={`px-4 py-2 rounded-full border-2 font-poppins font-semibold text-xs flex items-center gap-1.5 ${isDark ? "bg-white text-dark border-white hover:bg-background" : "bg-white border-dark/10 hover:border-dark/20"}`}>
                <Download size={14} className="w-3.5 h-3.5" /> Export CSV
              </button>
            )}
          </div>
        </div>
      )}
      {hideSearch && filterSlot && (
        <div className={`p-3 flex items-center justify-between border-b ${isDark ? "border-white/10 bg-white/[0.02]" : "border-dark/5 bg-background/20"}`}>
          <div className="flex items-center gap-2 flex-wrap flex-1">{filterSlot}</div>
          <span className={`font-poppins text-xs px-2 hidden sm:block ${isDark ? "text-white/60" : "text-muted"}`}>{filtered.length} items</span>
        </div>
      )}
      {selectable && selectedIds && selectedIds.size > 0 && (
        <div className={`px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b ${isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
          <span className={`font-poppins font-semibold text-sm flex items-center gap-2 ${isDark ? "text-amber-300" : "text-amber-700"}`}>
            <CheckSquare size={16} /> {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <button onClick={() => onSelectionChange?.(new Set())} className={`px-4 py-1.5 rounded-full text-xs font-poppins font-semibold border ${isDark ? "bg-white/10 text-white border-white/20 hover:bg-white/20" : "bg-white text-dark border-dark/10 hover:border-dark/20"}`}>Clear</button>
            {onBulkDelete && (
              <button onClick={() => onBulkDelete(Array.from(selectedIds))} className="px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-poppins font-semibold flex items-center gap-1.5 hover:bg-red-700">
                <Trash2 size={14} /> {bulkDeleteLabel} ({selectedIds.size})
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className={`border-b ${isDark ? "bg-white/5 border-white/10" : "bg-background/60 border-dark/5"}`}>
              {selectable && (
                <th className={`px-3 py-3 w-10 ${isDark ? "text-white/70" : "text-dark"}`}>
                  <button onClick={toggleAll} className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isAllSelected ? "bg-primary border-primary text-white" : isSomeSelected ? "bg-primary/20 border-primary text-primary" : isDark ? "border-white/20 bg-white/5" : "border-dark/20 bg-white"}`}>
                    {isAllSelected ? <CheckSquare size={12} /> : isSomeSelected ? <Square size={12} className="opacity-60" /> : null}
                  </button>
                </th>
              )}
              {columns.map((c) => (
                <th key={c.key} className={`text-left font-poppins font-bold text-xs tracking-wide px-4 py-3 uppercase whitespace-nowrap ${isDark ? "text-white/70" : "text-dark"}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-12">
                  <p className={`font-poppins text-sm ${isDark ? "text-white/60" : "text-muted"}`}>{emptyText}</p>
                  {query && <p className={`font-poppins text-xs mt-1 ${isDark ? "text-white/40" : "text-muted"}`}>No results for “{query}”</p>}
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => {
                const id = getId(row, idx);
                const checked = selectedIds?.has(id) || false;
                return (
                  <tr key={id} className={`border-b last:border-0 transition-colors ${isDark ? "border-white/10 hover:bg-white/5" : "border-dark/5 hover:bg-background/40"}`}>
                    {selectable && (
                      <td className="px-3 py-3">
                        <button onClick={() => toggleOne(id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked ? "bg-primary border-primary text-white" : isDark ? "border-white/20 bg-white/5 hover:border-primary/50" : "border-dark/20 bg-white hover:border-primary/50"}`}>
                          {checked && <CheckSquare size={12} />}
                        </button>
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key} className={`px-4 py-3 font-poppins text-sm align-middle ${isDark ? "text-white/90" : ""}`}>
                        {c.render ? c.render(row) : String(row[c.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={`p-4 flex items-center justify-between border-t ${isDark ? "border-white/10 bg-white/5" : "border-dark/5 bg-background/40"}`}>
          <p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>Page {currentPage} / {totalPages} • {filtered.length} total</p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center disabled:opacity-40 ${isDark ? "bg-white text-dark border-white" : "bg-white border-dark/10 hover:border-dark/20"}`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center disabled:opacity-40 ${isDark ? "bg-white text-dark border-white" : "bg-white border-dark/10 hover:border-dark/20"}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}