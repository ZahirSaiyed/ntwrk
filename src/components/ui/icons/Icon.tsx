import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

export type IconName = keyof typeof LucideIcons;

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName;
  size?: number | string;
  className?: string;
  label?: string; // For accessibility
  color?: string;
}

/**
 * Icon component that renders SVG icons from Lucide React
 * 
 * Usage:
 * ```tsx
 * <Icon name="Star" size={24} color="#1E1E3F" />
 * ```
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  className = '',
  label,
  ...rest
}) => {
  // Handle case where icon name doesn't exist
  if (!LucideIcons[name]) {
    console.warn(`Icon "${name}" does not exist in Lucide icons`);
    return null;
  }

  const LucideIcon = LucideIcons[name] as React.ComponentType<LucideProps>;
  const ariaLabel = label || `${name} icon`;

  return (
    <LucideIcon
      size={size}
      color={color}
      className={className}
      aria-label={ariaLabel}
      {...rest}
    />
  );
};

export default Icon; 