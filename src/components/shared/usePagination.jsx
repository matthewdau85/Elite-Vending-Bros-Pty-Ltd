import { useMemo, useState } from "react";

/**
 * A reusable hook for client-side pagination.
 * @param {Array} items - The full array of items to be paginated.
 * @param {number} [pageSize=20] - The number of items per page.
 * @returns {{
 *   currentPage: number,
 *   setCurrentPage: Function,
 *   totalPages: number,
 *   paginatedItems: Array,
 *   startIndex: number,
 *   endIndex: number
 * }}
 */
export function usePagination(items = [], pageSize = 20) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / pageSize));
  }, [items, pageSize]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, items.length);

  return { currentPage, setCurrentPage, totalPages, paginatedItems, startIndex, endIndex };
}