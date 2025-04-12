import React, { useRef, useState } from 'react';
import { Icon, IconName } from '../icons/Icon';
import theme from '../theme';

export interface FilterChipProps {
  label: string;
  icon?: IconName;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  badge?: number | string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  tooltipContent?: string;
  showSelectedIcon?: boolean;
}

/**
 * FilterChip component for toggling filters
 * 
 * Usage:
 * ```tsx
 * <FilterChip 
 *   label="Active" 
 *   icon="Activity" 
 *   selected={filter === 'active'} 
 *   onClick={() => setFilter(filter === 'active' ? '' : 'active')} 
 * />
 * ```
 */
export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  icon,
  selected = false,
  onClick,
  className = '',
  disabled = false,
  badge,
  color,
  size = 'md',
  tooltipContent,
  showSelectedIcon = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const chipRef = useRef<HTMLButtonElement>(null);
  
  // Handle tooltip logic
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (tooltipContent) {
      const timeout = setTimeout(() => setShowTooltip(true), 500);
      return () => clearTimeout(timeout);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
  };

  // Handle keyboard interaction
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  // Size-based classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs min-h-[32px]',
    md: 'px-3 py-1.5 text-sm min-h-[36px]',
    lg: 'px-4 py-2 text-base min-h-[44px]'
  };

  // Define icon sizes for each button size
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  // Create different classes for selected vs unselected to improve visual distinction
  const selectedClass = selected
    ? `bg-[${theme.colors.primary.light}] text-[${theme.colors.primary.dark}] border-[${theme.colors.primary.main}] font-semibold shadow-sm`
    : `bg-white text-[${theme.colors.text.primary}] border-gray-200 hover:bg-gray-50`;
  
  // Improve hover interaction
  const hoverClass = !disabled
    ? (selected
        ? `hover:bg-[${theme.colors.primary.light}] hover:shadow-md` 
        : `hover:border-gray-300 hover:bg-gray-50`)
    : '';

  // Enhanced focus state for accessibility 
  const focusClass = `focus:outline-none focus-visible:ring-2 focus-visible:ring-[${theme.colors.primary.main}] focus-visible:ring-offset-2`;

  // Determine min width to prevent filter chips from being too small
  const minWidthClass = {
    sm: 'min-w-[4rem]',
    md: 'min-w-[5rem]',
    lg: 'min-w-[6rem]'
  };

  // Transition for all property changes
  const transitionClass = 'transition-all duration-150';

  const chipClasses = `
    ${sizeClasses[size]}
    ${minWidthClass[size]}
    ${selectedClass}
    ${hoverClass}
    ${focusClass}
    rounded-full
    border
    ${transitionClass}
    flex
    items-center
    justify-center
    gap-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
    relative
    ${isHovered ? 'z-10' : 'z-0'}
  `;

  return (
    <div className="relative inline-flex">
      <button
        ref={chipRef}
        className={chipClasses}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        role="button"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        aria-label={`Filter by ${label}${selected ? ' (selected)' : ''}`}
      >
        {icon && (
          <Icon 
            name={icon} 
            size={iconSizes[size]} 
            className={selected ? 'text-[#4B4BA6]' : 'text-gray-500'}
          />
        )}
        <span className="truncate">{label}</span>
        {selected && showSelectedIcon && (
          <Icon
            name="Check"
            size={iconSizes[size] - 2}
            className="text-[#4B4BA6] ml-0.5"
          />
        )}
        {badge !== undefined && (
          <span 
            className={`
              ${selected ? 'bg-[#4B4BA6]/20 text-[#4B4BA6]' : 'bg-gray-100 text-gray-700'} 
              rounded-full px-2 py-0.5 text-xs ml-0.5 font-medium
            `}
          >
            {badge}
          </span>
        )}
      </button>
      
      {/* Tooltip */}
      {tooltipContent && showTooltip && (
        <div 
          className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50 shadow-md"
          role="tooltip"
        >
          {tooltipContent}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default FilterChip; 