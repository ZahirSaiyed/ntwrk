import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface TooltipContextType {
  showTooltip: (content: React.ReactNode, rect: DOMRect) => void;
  hideTooltip: () => void;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

// Define possible tooltip placements
type Placement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipPosition {
  top: number;
  left: number;
  placement: Placement;
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
}

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tooltipContent, setTooltipContent] = useState<React.ReactNode | null>(null);
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0, placement: 'top' });
  const [visible, setVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [hideTimeout]);

  // Calculate best placement based on available space
  const calculateOptimalPlacement = (
    rect: DOMRect, 
    tooltipWidth: number, 
    tooltipHeight: number
  ): Placement => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const buffer = 12; // Minimum space from window edge
    
    // Check if there's room above
    const hasRoomAbove = rect.top > tooltipHeight + buffer;
    
    // Check if there's room below
    const hasRoomBelow = windowHeight - rect.bottom > tooltipHeight + buffer;
    
    // Check if there's room to the left
    const hasRoomLeft = rect.left > tooltipWidth + buffer;
    
    // Check if there's room to the right
    const hasRoomRight = windowWidth - rect.right > tooltipWidth + buffer;
    
    // Prefer top or bottom placement
    if (hasRoomAbove) return 'top';
    if (hasRoomBelow) return 'bottom';
    if (hasRoomLeft) return 'left';
    if (hasRoomRight) return 'right';
    
    // Default to top if no good position exists
    return 'top';
  };

  const showTooltip = (content: React.ReactNode, rect: DOMRect) => {
    // Clear any existing hide timeouts
    if (hideTimeout) clearTimeout(hideTimeout);
    
    // Show the tooltip immediately with null content to measure it
    setTooltipContent(content);
    setVisible(true);
    
    // Use a short timeout to allow the tooltip to render before measuring
    setTimeout(() => {
      if (tooltipRef.current) {
        const tooltipWidth = tooltipRef.current.offsetWidth;
        const tooltipHeight = tooltipRef.current.offsetHeight;
        
        // Determine the best placement based on available space
        const placement = calculateOptimalPlacement(rect, tooltipWidth, tooltipHeight);
        
        // Calculate position based on placement
        let tooltipTop: number;
        let tooltipLeft: number;
        
        switch (placement) {
          case 'top':
            tooltipTop = rect.top - tooltipHeight - 8; // 8px spacing
            tooltipLeft = rect.left + (rect.width / 2);
            break;
          case 'bottom':
            tooltipTop = rect.bottom + 8; // 8px spacing
            tooltipLeft = rect.left + (rect.width / 2);
            break;
          case 'left':
            tooltipTop = rect.top + (rect.height / 2);
            tooltipLeft = rect.left - tooltipWidth - 8; // 8px spacing
            break;
          case 'right':
            tooltipTop = rect.top + (rect.height / 2);
            tooltipLeft = rect.right + 8; // 8px spacing
            break;
          default:
            tooltipTop = rect.top - tooltipHeight - 8;
            tooltipLeft = rect.left + (rect.width / 2);
        }
        
        // Keep tooltip within viewport bounds
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Ensure the tooltip doesn't go off the right or left edge
        if (placement === 'top' || placement === 'bottom') {
          const minLeft = tooltipWidth / 2 + 10;
          const maxLeft = windowWidth - (tooltipWidth / 2) - 10;
          
          tooltipLeft = Math.max(minLeft, Math.min(tooltipLeft, maxLeft));
        }
        
        // Ensure the tooltip doesn't go off the top or bottom edge
        if (placement === 'left' || placement === 'right') {
          const minTop = tooltipHeight / 2 + 10;
          const maxTop = windowHeight - (tooltipHeight / 2) - 10;
          
          tooltipTop = Math.max(minTop, Math.min(tooltipTop, maxTop));
        }
        
        // Set the final position
        setPosition({ top: tooltipTop, left: tooltipLeft, placement });
      }
    }, 10);
  };

  const hideTooltip = () => {
    // Start fade-out animation
    setVisible(false);
    
    // Clear any existing timeouts
    if (hideTimeout) clearTimeout(hideTimeout);
    
    // Only actually remove from DOM after animation completes
    const timeout = setTimeout(() => {
      setTooltipContent(null);
    }, 150); // Matches transition duration - faster for more snappiness
    
    setHideTimeout(timeout);
  };

  // Calculate arrow position and styles based on placement
  const getArrowStyles = () => {
    switch (position.placement) {
      case 'top':
        return `
          bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2
          border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent
          border-t-[6px] border-l-[5px] border-r-[5px] border-b-0
        `;
      case 'bottom':
        return `
          top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
          border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent
          border-b-[6px] border-l-[5px] border-r-[5px] border-t-0
        `;
      case 'left':
        return `
          right-0 top-1/2 translate-x-1/2 -translate-y-1/2
          border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent
          border-l-[6px] border-t-[5px] border-b-[5px] border-r-0
        `;
      case 'right':
        return `
          left-0 top-1/2 -translate-x-1/2 -translate-y-1/2
          border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent
          border-r-[6px] border-t-[5px] border-b-[5px] border-l-0
        `;
      default:
        return `
          bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2
          border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent
          border-t-[6px] border-l-[5px] border-r-[5px] border-b-0
        `;
    }
  };

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      
      {tooltipContent && (
        <div 
          ref={tooltipRef}
          className={`
            fixed transform 
            ${position.placement === 'top' || position.placement === 'bottom' ? '-translate-x-1/2' : ''}
            ${position.placement === 'left' || position.placement === 'right' ? '-translate-y-1/2' : ''}
            bg-gray-900 text-white text-xs rounded-md py-1.5 px-2.5
            leading-4 whitespace-nowrap shadow-md 
            border border-gray-800 
            z-[9999] 
            transition-all duration-150 
            ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            maxWidth: '18rem',
            transformOrigin: position.placement === 'top' ? 'bottom center' : 
                           position.placement === 'bottom' ? 'top center' :
                           position.placement === 'left' ? 'right center' : 'left center'
          }}
          role="tooltip"
        >
          {tooltipContent}
          <div className={`absolute border ${getArrowStyles()}`}></div>
        </div>
      )}
    </TooltipContext.Provider>
  );
};

export function withTooltip<P extends object>(
  Component: React.ComponentType<P>, 
  tooltipContent: React.ReactNode
): React.FC<P> {
  const WithTooltipComponent: React.FC<P> = (props: P) => {
    const { showTooltip, hideTooltip } = useTooltip();
    const ref = React.useRef<HTMLDivElement>(null);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    
    const handleMouseEnter = () => {
      if (ref.current) {
        // Clear any existing timeout
        if (timerRef.current) clearTimeout(timerRef.current);
        
        // Set a new timeout for 300ms (more responsive like Apple)
        timerRef.current = setTimeout(() => {
          showTooltip(tooltipContent, ref.current!.getBoundingClientRect());
        }, 300);
      }
    };
    
    const handleMouseLeave = () => {
      // Clear any pending show timeouts
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Hide tooltip immediately for snappiness (like Shopify)
      hideTooltip();
    };
    
    // Clean up on unmount
    React.useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);
    
    return (
      <div 
        ref={ref} 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        <Component {...props} />
      </div>
    );
  };
  
  WithTooltipComponent.displayName = `WithTooltip(${getDisplayName(Component)})`;
  
  return WithTooltipComponent;
}

// Helper function to get the display name of a component
function getDisplayName<P>(Component: React.ComponentType<P>): string {
  return Component.displayName || Component.name || 'Component';
} 