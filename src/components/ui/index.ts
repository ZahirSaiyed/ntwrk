// Theme exports
export { default as theme } from './theme';
export * from './styles';

// Icon exports
export { default as Icon } from './icons/Icon';
export type { IconName, IconProps } from './icons/Icon';

// Button exports
export { default as Button } from './buttons/Button';
export type { ButtonVariant, ButtonSize, ButtonProps } from './buttons/Button';

export { default as IconButton } from './buttons/IconButton';
export type { IconButtonVariant, IconButtonSize, IconButtonProps } from './buttons/IconButton';

// Card exports
export * from './card';

// Filter exports
export { default as FilterChip } from './filters/FilterChip';
export type { FilterChipProps } from './filters/FilterChip';

// Version number for design system
export const UI_VERSION = '0.1.0'; 