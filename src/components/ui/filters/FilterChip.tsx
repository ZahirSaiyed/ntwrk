import React from 'react';
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
 *   onClick={() => setFilter('active')} 
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
}) => {
  // Size-based classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  // Define icon sizes for each button size
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  // Determine appearance based on selected state
  const selectedClass = selected 
    ? `bg-[${theme.colors.primary.main}] text-white border-transparent`
    : `bg-white text-[${theme.colors.text.primary}] border-gray-200 hover:bg-[${theme.colors.gray[50]}]`;

  // Handle accessibility on keyboard focus
  const focusClass = `focus:outline-none focus:ring-2 focus:ring-[${theme.colors.primary.main}]/50`;

  // Determine min width to prevent filter chips from being too small
  const minWidthClass = {
    sm: 'min-w-[4rem]',
    md: 'min-w-[5rem]',
    lg: 'min-w-[6rem]'
  };

  const chipClasses = `
    ${sizeClasses[size]}
    ${minWidthClass[size]}
    ${selectedClass}
    ${focusClass}
    font-medium
    rounded-full
    border
    transition-all
    duration-200
    flex
    items-center
    justify-center
    gap-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <button
      className={chipClasses}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      role="checkbox"
    >
      {icon && (
        <Icon 
          name={icon} 
          size={iconSizes[size]} 
          className={selected ? '' : 'text-gray-500'}
        />
      )}
      <span>{label}</span>
      {badge !== undefined && (
        <span 
          className={`
            ${selected ? 'bg-white/20' : 'bg-gray-100'} 
            rounded-full px-2 py-0.5 text-xs ml-1
          `}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

export default FilterChip; 