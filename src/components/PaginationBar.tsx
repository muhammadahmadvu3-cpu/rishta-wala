import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationBarProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

export function PaginationBar({
  currentPage,
  totalItems,
  pageSize = 9,
  itemLabel,
  onPageChange,
}: PaginationBarProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIdx = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIdx = Math.min(totalItems, safePage * pageSize);

  if (totalItems === 0) return null;

  // Build page list cleanly (show all pages up to 10; if > 10, show a clean 10-slot window)
  const pages: number[] = [];
  if (totalPages <= 10) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    let start = Math.max(1, safePage - 4);
    const end = Math.min(totalPages, start + 9);
    if (end - start < 9) {
      start = Math.max(1, end - 9);
    }
    for (let i = start; i <= end; i++) pages.push(i);
  }

  return (
    <nav
      aria-label={`${itemLabel} pagination`}
      className="mt-8 pt-6 border-t border-[#E7E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <p className="text-xs text-[#5C574F] tabular-nums">
        Showing <strong className="text-[#1A1917]">{startIdx}–{endIdx}</strong> of{' '}
        <strong className="text-[#1A1917]">{totalItems}</strong> {itemLabel} · Page{' '}
        <strong className="text-[#1A1917]">{safePage}</strong> of{' '}
        <strong className="text-[#1A1917]">{totalPages}</strong>
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#1A1917] bg-white border border-[#E7E2DA] rounded-lg hover:bg-[#F3EFE9] disabled:opacity-45 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Previous</span>
        </button>

        {pages.map((pageNum) => {
          const isActive = pageNum === safePage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-w-8 h-8 px-2 text-xs font-mono font-medium rounded-lg transition-colors tabular-nums cursor-pointer ${
                isActive
                  ? 'bg-[#0F5C4D] text-white border border-[#0F5C4D]'
                  : 'bg-white text-[#1A1917] border border-[#E7E2DA] hover:bg-[#F3EFE9]'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1A1917] bg-white border border-[#E7E2DA] rounded-lg hover:bg-[#F3EFE9] disabled:opacity-45 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Next Page</span>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
