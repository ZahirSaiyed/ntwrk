import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showKeyboardHint?: boolean;
  itemsPerPage?: number;
  totalItems?: number;
  onPageSizeChange?: (size: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '',
  showKeyboardHint = true,
  itemsPerPage = 10,
  totalItems = 0,
  onPageSizeChange
}: PaginationProps) {
  const paginationRef = useRef<HTMLDivElement>(null);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Calculate item range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Focus management for keyboard users coming from the table
  useEffect(() => {
    const handleTableKeyboardNav = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey && document.activeElement?.getAttribute('aria-label') === 'Contacts table') {
        e.preventDefault();
        paginationRef.current?.focus();
        setIsKeyboardFocused(true);
        setShowHint(true);
      }
    };

    document.addEventListener('keydown', handleTableKeyboardNav);
    return () => document.removeEventListener('keydown', handleTableKeyboardNav);
  }, []);
  
  // Auto-hide hint after a delay
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => {
        setShowHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showHint]);

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

  // Handler for keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Show keyboard hint when navigation starts
    setIsKeyboardFocused(true);
    setShowHint(true);
    
    // Left arrow or Page Up goes to previous page
    if ((e.key === 'ArrowLeft' || e.key === 'PageUp') && currentPage > 1) {
      e.preventDefault();
      onPageChange(currentPage - 1);
    }
    // Right arrow or Page Down goes to next page
    else if ((e.key === 'ArrowRight' || e.key === 'PageDown') && currentPage < totalPages) {
      e.preventDefault();
      onPageChange(currentPage + 1);
    }
    // Home goes to first page
    else if (e.key === 'Home') {
      e.preventDefault();
      onPageChange(1);
    }
    // End goes to last page
    else if (e.key === 'End') {
      e.preventDefault();
      onPageChange(totalPages);
    }
  };
  
  // Reset keyboard focus state on mouse interaction
  const handleMouseInteraction = () => {
    setIsKeyboardFocused(false);
  };

  return (
    <div 
      ref={paginationRef}
      className={`flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200 ${className}`}
      onKeyDown={handleKeyDown}
      onClick={handleMouseInteraction}
      tabIndex={0}
      aria-label="Pagination Navigation"
    >
      {/* Keyboard Hint Tooltip - only shown when keyboard focused */}
      <AnimatePresence>
        {showHint && isKeyboardFocused && showKeyboardHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 bg-[#1E1E3F] text-white text-xs rounded-lg px-3 py-2 z-10 shadow-md"
          >
            <div className="flex items-center gap-2">
              <span>Keyboard Navigation:</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[#1E1E3F]/80 border border-white/20 rounded text-xs">←</kbd>
                <kbd className="px-1.5 py-0.5 bg-[#1E1E3F]/80 border border-white/20 rounded text-xs">→</kbd>
              </div>
            </div>
            {/* Arrow pointing down */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-[#1E1E3F] transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left side - Page size + Result count */}
      <div className="flex items-center space-x-6">
        {onPageSizeChange ? (
          <div className="flex items-center group">
            <span className="text-sm text-gray-500 mr-2.5 group-hover:text-[#1E1E3F] transition-colors duration-200">Rows per page</span>
            <div className="relative">
              <select
                className="appearance-none block w-16 px-2.5 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E1E3F] hover:border-[#1E1E3F]/50 transition-colors duration-200"
                value={itemsPerPage}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                aria-label="Rows per page"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        ) : null}
        
        <div className="text-sm text-gray-500">
          Showing 
          <span className="font-medium mx-1 text-gray-700">
            {startItem}-{endItem}
          </span> 
          of 
          <span className="font-medium ml-1 text-gray-700">
            {totalItems}
          </span>
        </div>
      </div>

      {/* Updated layout: Combine page navigation and go-to */}
      <div className="flex items-center">
        {/* Center - Page number navigation - Moved more to the right */}
        <div className="hidden sm:flex sm:items-center mr-5">
          {/* Fast backward */}
          {currentPage > 2 && (
            <button
              onClick={() => onPageChange(1)}
              className="relative inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-[#F4F4FF]/50 focus:ring-2 focus:ring-[#1E1E3F]/20 focus:outline-none transition-colors duration-200"
              aria-label="First page"
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
            className="relative inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-[#F4F4FF]/50 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#1E1E3F]/20 focus:outline-none transition-colors duration-200"
            aria-label="Previous page"
          >
            <span className="sr-only">Previous</span>
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Page numbers */}
          <nav className="relative z-0 inline-flex rounded-md shadow-sm mx-1" aria-label="Pagination">
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
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-[#1E1E3F]/20 transition-colors duration-200
                    ${currentPage === page
                      ? 'z-10 bg-[#1E1E3F] border-[#1E1E3F] text-white'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-[#F4F4FF]/50'
                    }`}
                  aria-current={currentPage === page ? 'page' : undefined}
                  aria-label={`Page ${page}`}
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
            className="relative inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-[#F4F4FF]/50 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#1E1E3F]/20 focus:outline-none transition-colors duration-200"
            aria-label="Next page"
          >
            <span className="sr-only">Next</span>
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Fast forward */}
          {currentPage < totalPages - 1 && (
            <button
              onClick={() => onPageChange(totalPages)}
              className="relative inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-[#F4F4FF]/50 focus:ring-2 focus:ring-[#1E1E3F]/20 focus:outline-none transition-colors duration-200"
              aria-label="Last page"
            >
              <span className="sr-only">Last page</span>
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0L11 10.414l-5.293-5.293a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 001.414 0L17 10.414l-5.293-5.293a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Right side - Go to page input - Reduced space */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 font-medium">Go to:</span>
          <div className="relative">
            <input
              type="text"
              className="w-20 px-3 py-1.5 text-sm bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1E1E3F] hover:border-[#1E1E3F]/50 transition-colors duration-200"
              placeholder={`1-${totalPages}`}
              onKeyDown={handleJumpToPage}
              aria-label="Go to page number"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile view - Only shown on small screens */}
      <div className="sm:hidden flex justify-between w-full">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-[#F4F4FF]/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="px-4 py-2 text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-[#F4F4FF]/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
