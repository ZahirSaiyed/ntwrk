import React from 'react';
import { Icon, IconName } from '../icons/Icon';
import theme from '../theme';

export type IconButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  tooltip?: string;
  isLoading?: boolean;
  className?: string;
  label: string; // For accessibility - required
}

/**
 * IconButton component for icon-only buttons
 * 
 * Usage:
 * ```tsx
 * <IconButton 
 *   icon="Trash2" 
 *   variant="danger" 
 *   label="Delete item" 
 *   onClick={handleDelete} 
 * />
 * ```
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'primary',
  size = 'md',
  tooltip,
  isLoading = false,
  className = '',
  label,
  disabled,
  ...rest
}) => {
  // Size-based classes
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  // Button dimensions for accessibility
  const dimensions = {
    sm: {
      size: 'min-h-[2rem] min-w-[2rem]',
      iconSize: 16
    },
    md: {
      size: 'min-h-[2.5rem] min-w-[2.5rem]',
      iconSize: 20
    },
    lg: {
      size: 'min-h-[3rem] min-w-[3rem]',
      iconSize: 24
    }
  };

  // Variant-based classes
  const variantClasses = {
    primary: `bg-[${theme.colors.primary.main}] text-white hover:bg-[${theme.colors.primary.hover}] focus:ring-2 focus:ring-[${theme.colors.primary.main}]/50 active:bg-[${theme.colors.primary.active}]`,
    secondary: `bg-white text-[${theme.colors.primary.main}] border border-[${theme.colors.primary.main}] hover:bg-[${theme.colors.primary.light}] focus:ring-2 focus:ring-[${theme.colors.primary.main}]/40 active:bg-[${theme.colors.primary.light}]`,
    tertiary: `bg-transparent text-[${theme.colors.primary.main}] hover:bg-[${theme.colors.primary.light}] focus:ring-2 focus:ring-[${theme.colors.primary.main}]/30`,
    danger: `bg-[${theme.colors.error.main}] text-white hover:bg-[${theme.colors.error.dark}] focus:ring-2 focus:ring-[${theme.colors.error.main}]/50 active:bg-[${theme.colors.error.dark}]`
  };

  // Combining classes
  const buttonClasses = `
    ${sizeClasses[size]}
    ${dimensions[size].size}
    ${variantClasses[variant]}
    rounded-lg
    flex
    items-center
    justify-center
    transition-all
    duration-200
    focus:outline-none
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `;

  // Tooltip support - We're using aria-label, but a proper tooltip component would be better
  const tooltipProps = tooltip ? {
    'aria-label': tooltip,
    'data-tooltip': tooltip
  } : {};

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      aria-label={label}
      {...tooltipProps}
      {...rest}
    >
      {isLoading ? (
        <svg className="animate-spin" width={dimensions[size].iconSize} height={dimensions[size].iconSize} viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <Icon name={icon} size={dimensions[size].iconSize} />
      )}
    </button>
  );
};

export default IconButton; 