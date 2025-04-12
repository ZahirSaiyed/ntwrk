import React from 'react';
import { Icon, IconName } from '../icons/Icon';
import theme from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Button component with different variants and sizes
 * 
 * Usage:
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="secondary" icon="ArrowRight" iconPosition="right">Continue</Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...rest
}) => {
  // Size-based classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Determine minimum dimensions for accessibility (44px)
  const minHeightClass = {
    sm: 'min-h-[2rem]',
    md: 'min-h-[2.5rem]',
    lg: 'min-h-[3rem]'
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
    ${minHeightClass[size]}
    ${variantClasses[variant]}
    ${fullWidth ? 'w-full' : ''}
    rounded-lg
    font-medium
    flex
    items-center
    justify-center
    gap-2
    transition-all
    duration-200
    focus:outline-none
    overflow-hidden
    select-none
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  // Icon size based on button size
  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
      )}
      
      {icon && iconPosition === 'left' && !isLoading && (
        <Icon name={icon} size={iconSize[size]} />
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && !isLoading && (
        <Icon name={icon} size={iconSize[size]} />
      )}
    </button>
  );
};

export default Button; 