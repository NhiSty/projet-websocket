import { ChevronLeft, ChevronRightIcon } from "lucide-react";
import { ReactElement } from "react";

interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  maxPages: number;
  totalPages: number;
}

export function Pagination({
  page,
  setPage,
  maxPages,
  totalPages,
}: PaginationProps): JSX.Element {
  const pagesToShow: ReactElement<HTMLButtonElement>[] = [];
  const startPage = Math.max(page - maxPages, 1);
  const endPage = Math.min(page + maxPages, totalPages);

  for (let i = startPage; i <= endPage; i++) {
    pagesToShow.push(
      <button
        type="button"
        key={i}
        className={`join-item btn ${i === page ? "btn-active" : ""}`}
        onClick={() => setPage(i)}
      >
        {i}
      </button>
    );
  }

  if (startPage > 1) {
    pagesToShow.unshift(
      <button
        type="button"
        key="prev"
        className="join-item btn"
        onClick={() => setPage(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
    );
  }

  if (endPage < maxPages && endPage < totalPages) {
    pagesToShow.push(
      <button
        type="button"
        key="next"
        className="join-item btn"
        onClick={() => setPage(page + 1)}
        aria-label="Next page"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
    );
  }

  return (
    <nav className="join" aria-label="pagination">
      {pagesToShow}
    </nav>
  );
}
