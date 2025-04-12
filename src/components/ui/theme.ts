export const theme = {
  colors: {
    primary: {
      main: '#1E1E3F',
      light: '#F4F4FF',
      dark: '#2D2D5F',
      hover: '#2D2D5F',
      active: '#4B4BA6',
      contrast: '#FFFFFF'
    },
    gray: {
      50: '#FAFAFA',
      100: '#F4F4F4',
      200: '#E8E8E8',
      300: '#D1D1D1',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    success: {
      light: '#ECFDF5',
      main: '#10B981',
      dark: '#047857',
      contrast: '#FFFFFF'
    },
    warning: {
      light: '#FFFBEB',
      main: '#F59E0B',
      dark: '#B45309',
      contrast: '#FFFFFF'
    },
    error: {
      light: '#FEF2F2',
      main: '#EF4444',
      dark: '#B91C1C',
      contrast: '#FFFFFF'
    },
    info: {
      light: '#EFF6FF',
      main: '#3B82F6',
      dark: '#1D4ED8',
      contrast: '#FFFFFF'
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1E1E3F',
      secondary: '#525252',
      disabled: '#A3A3A3'
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '24px',
    full: '9999px'
  },
  
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    '4xl': '2.5rem'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  
  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    medium: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // Breakpoints
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Z-index values
  zIndex: {
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500
  }
};

export type Theme = typeof theme;

export default theme; 