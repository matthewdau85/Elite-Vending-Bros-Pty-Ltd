import React, { useMemo, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePagination } from './usePagination';

// Memoized table row to prevent unnecessary re-renders
const MemoizedTableRow = React.memo(({ item, columns, onRowClick }) => (
  <TableRow 
    className={onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}
    onClick={onRowClick ? () => onRowClick(item) : undefined}
  >
    {columns.map((column) => (
      <TableCell key={column.key} className={column.className}>
        {column.render ? column.render(item[column.key], item) : item[column.key]}
      </TableCell>
    ))}
  </TableRow>
));

MemoizedTableRow.displayName = 'MemoizedTableRow';

// High-performance data table with virtualization for large datasets
const DataTable = React.memo(({ 
  data = [], 
  columns = [], 
  pageSize = 50,
  searchable = true,
  onRowClick,
  className = '',
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Memoized filtered data to prevent recalculation on every render
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    const searchLower = searchTerm.toLowerCase();
    return data.filter(item => 
      columns.some(column => {
        const value = item[column.key];
        return value && value.toString().toLowerCase().includes(searchLower);
      })
    );
  }, [data, searchTerm, columns]);

  // Memoized pagination to prevent recalculation
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
    startIndex,
    endIndex
  } = usePagination(filteredData, pageSize);

  // Memoized search handler
  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  }, [setCurrentPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {searchable && <div className="h-10 bg-slate-200 rounded animate-pulse" />}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.headerClassName}>
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array(10).fill(0).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.headerClassName}>
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-slate-500">
                  {searchTerm ? 'No results found' : 'No data available'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item, index) => (
                <MemoizedTableRow
                  key={item.id || index}
                  item={item}
                  columns={columns}
                  onRowClick={onRowClick}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {startIndex + 1} to {endIndex} of {filteredData.length} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

DataTable.displayName = 'DataTable';

export default DataTable;