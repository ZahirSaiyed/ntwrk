interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('...');
    }
    
    // Calculate range around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust range if at the start or end
    if (currentPage <= 3) {
      end = Math.min(4, totalPages - 1);
    }
    if (currentPage >= totalPages - 2) {
      start = Math.max(totalPages - 3, 2);
    }
    
    // Add range numbers
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add final ellipsis and last page
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Jump to specific page handler
  const handleJumpToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.currentTarget;
      const value = parseInt(target.value);
      if (!isNaN(value) && value >= 1 && value <= totalPages) {
        onPageChange(value);
        target.value = '';
      }
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      {/* Mobile view */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
          
          {/* Quick jump input */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Go to:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              onKeyDown={handleJumpToPage}
              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E1E3F]"
              placeholder="Page"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Fast backward */}
          {currentPage > 3 && (
            <button
              onClick={() => onPageChange(1)}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <span className="sr-only">First page</span>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0L9 10.414l5.293-5.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M9.707 15.707a1 1 0 01-1.414 0L3 10.414l5.293-5.293a1 1 0 111.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}

          {/* Previous */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Previous</span>
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Page numbers */}
          <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                    ${currentPage === page
                      ? 'z-10 bg-[#1E1E3F] border-[#1E1E3F] text-white'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              )
            ))}
          </nav>

          {/* Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Next</span>
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Fast forward */}
          {currentPage < totalPages - 2 && (
            <button
              onClick={() => onPageChange(totalPages)}
              className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <span className="sr-only">Last page</span>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0L11 10.414l-5.293-5.293a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 001.414 0L17 10.414l-5.293-5.293a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
