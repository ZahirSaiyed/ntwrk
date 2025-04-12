import { useState, useRef, useEffect } from 'react';
import { useTooltip } from './ui/TooltipProvider';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  shortcut?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ 
  children, 
  content,
  shortcut,
  placement = 'top'
}: TooltipProps) {
  const [showOriginalTooltip, setShowOriginalTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { showTooltip, hideTooltip } = useTooltip();
  
  // Check to see if the TooltipProvider is available by checking if the context returns valid values
  const hasGlobalTooltip = typeof showTooltip === 'function' && typeof hideTooltip === 'function';
  
  // Add Shortcut to content if provided
  const displayContent = shortcut 
    ? (
        <div>
          {content}
          <div className="text-gray-400 mt-1 text-[10px] font-mono">
            {shortcut}
          </div>
        </div>
      ) 
    : content;
  
  const handleMouseEnter = () => {
    if (hasGlobalTooltip && containerRef.current) {
      // Clear any existing timeout
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
      
      // Use a timeout of 300ms for a more responsive feel like Apple
      tooltipTimerRef.current = setTimeout(() => {
        showTooltip(displayContent, containerRef.current!.getBoundingClientRect());
      }, 300);
    } else {
      // Fallback to original implementation if global provider not available
      setShowOriginalTooltip(true);
    }
  };
  
  const handleMouseLeave = () => {
    // Clear any pending show timeouts
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    
    if (hasGlobalTooltip) {
      // Hide tooltip immediately for snappiness (like Shopify)
      hideTooltip();
    } else {
      setShowOriginalTooltip(false);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  return (
    <div 
      className="relative inline-flex"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Only show the local tooltip if global system is not available */}
      {!hasGlobalTooltip && showOriginalTooltip && (
        <div 
          role="tooltip"
          className={`
            absolute z-50 px-2.5 py-1.5
            text-xs leading-4 text-white
            bg-gray-900 rounded-md
            shadow-md
            border border-gray-800
            whitespace-nowrap
            transition-all duration-150
            ${placement === 'top' ? 'bottom-full mb-1' : ''}
            ${placement === 'bottom' ? 'top-full mt-1' : ''}
            ${placement === 'left' ? 'right-full mr-1' : ''}
            ${placement === 'right' ? 'left-full ml-1' : ''}
            ${placement === 'bottom' || placement === 'top' ? 'left-1/2 -translate-x-1/2' : ''}
            ${placement === 'left' || placement === 'right' ? 'top-1/2 -translate-y-1/2' : ''}
          `}
        >
          {displayContent}
          <div className={`
            absolute border
            ${placement === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent border-t-[6px] border-l-[5px] border-r-[5px] border-b-0' : ''}
            ${placement === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent border-b-[6px] border-l-[5px] border-r-[5px] border-t-0' : ''}
            ${placement === 'left' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent border-l-[6px] border-t-[5px] border-b-[5px] border-r-0' : ''}
            ${placement === 'right' ? 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent border-r-[6px] border-t-[5px] border-b-[5px] border-l-0' : ''}
          `}></div>
        </div>
      )}
    </div>
  );
}
