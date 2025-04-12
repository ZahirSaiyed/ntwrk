import theme from './theme';

// Helper for creating consistent typography classes
export const typography = {
  h1: `text-4xl font-bold text-[${theme.colors.text.primary}]`,
  h2: `text-3xl font-bold text-[${theme.colors.text.primary}]`,
  h3: `text-2xl font-bold text-[${theme.colors.text.primary}]`,
  h4: `text-xl font-bold text-[${theme.colors.text.primary}]`,
  h5: `text-lg font-bold text-[${theme.colors.text.primary}]`,
  h6: `text-base font-bold text-[${theme.colors.text.primary}]`,
  body1: `text-base text-[${theme.colors.text.primary}]`,
  body2: `text-sm text-[${theme.colors.text.secondary}]`,
  caption: `text-xs text-[${theme.colors.text.secondary}]`,
};

// Helper for creating consistent layout classes
export const layout = {
  section: 'py-8',
  container: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
  card: 'bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm',
  cardBody: 'p-6',
  cardHeader: 'px-6 py-4 border-b border-gray-200',
  cardFooter: 'px-6 py-4 border-t border-gray-200',
};

// Helper for creating consistent spacing classes
export const spacing = {
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  xxl: 'p-12',
};

// Common flex layouts
export const flex = {
  row: 'flex flex-row',
  col: 'flex flex-col',
  rowCenter: 'flex flex-row items-center',
  colCenter: 'flex flex-col items-center',
  center: 'flex items-center justify-center',
  between: 'flex items-center justify-between',
  end: 'flex items-center justify-end',
  wrap: 'flex flex-wrap',
};

// Animation classes
export const animation = {
  fadeIn: 'animate-fadeIn',
  fadeOut: 'animate-fadeOut',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
};

// Consistent form element styles
export const formElements = {
  input: `w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[${theme.colors.primary.main}]/50 focus:border-[${theme.colors.primary.main}] outline-none transition-all duration-200`,
  select: `w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[${theme.colors.primary.main}]/50 focus:border-[${theme.colors.primary.main}] outline-none transition-all duration-200`,
  checkbox: `h-4 w-4 rounded border-gray-300 text-[${theme.colors.primary.main}] focus:ring-[${theme.colors.primary.main}]`,
  radio: `h-4 w-4 border-gray-300 text-[${theme.colors.primary.main}] focus:ring-[${theme.colors.primary.main}]`,
  label: 'block text-sm font-medium text-gray-700 mb-1',
  formGroup: 'mb-4',
};

// Consistent transition styles
export const transitions = {
  default: 'transition-all duration-200 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  bounce: 'transition-all duration-300 cubic-bezier(0.68, -0.55, 0.27, 1.55)',
};

// Consistent shadow styles
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  none: 'shadow-none',
};

// Button styles with consistent focus states
export const buttons = {
  primary: `bg-[${theme.colors.primary.main}] text-white rounded-lg px-4 py-2 font-medium hover:bg-[${theme.colors.primary.hover}] focus:outline-none focus:ring-2 focus:ring-[${theme.colors.primary.main}]/50 disabled:opacity-50`,
  secondary: `bg-white text-[${theme.colors.primary.main}] border border-[${theme.colors.primary.main}] rounded-lg px-4 py-2 font-medium hover:bg-[${theme.colors.primary.light}] focus:outline-none focus:ring-2 focus:ring-[${theme.colors.primary.main}]/50 disabled:opacity-50`,
  tertiary: `text-[${theme.colors.primary.main}] rounded-lg px-4 py-2 font-medium hover:bg-[${theme.colors.primary.light}] focus:outline-none focus:ring-2 focus:ring-[${theme.colors.primary.main}]/30 disabled:opacity-50`,
  danger: `bg-[${theme.colors.error.main}] text-white rounded-lg px-4 py-2 font-medium hover:bg-[${theme.colors.error.dark}] focus:outline-none focus:ring-2 focus:ring-[${theme.colors.error.main}]/50 disabled:opacity-50`,
};

export default {
  typography,
  layout,
  spacing,
  flex,
  animation,
  formElements,
  transitions,
  shadows,
  buttons,
}; 