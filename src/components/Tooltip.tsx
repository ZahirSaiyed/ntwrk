import { useState } from 'react';

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
  placement = 'bottom'
}: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex">
      <div 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      
      {show && (
        <div 
          role="tooltip"
          className={`
            absolute z-50 px-2.5 py-1
            text-[11px] leading-4 text-white
            bg-gray-800/95 rounded-md
            min-w-[360px]
            text-center
            left-1/2 -translate-x-1/2
            top-full mt-1
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
}
