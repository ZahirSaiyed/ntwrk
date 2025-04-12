# Tooltip Style Guide

## Overview

This document outlines the design and implementation standards for tooltips across the application. The tooltip system is designed with inspiration from Apple and Shopify to be consistent, performant, aesthetic, and accessible.

## Core Principles

1. **One tooltip at a time**: Only one tooltip should be visible at any given time to avoid visual clutter and improve performance.
2. **Adaptive positioning**: Tooltips intelligently position themselves based on available screen space.
3. **Subtle animation**: Tooltips use a subtle scale + fade animation for a refined appearance.
4. **Smart timing**: 300ms delay on show (responsive feel) with immediate hide (for snappiness).
5. **Consistent styling**: All tooltips follow the same design patterns for visual consistency.
6. **Accessible**: Tooltips are accessible to all users, including those using screen readers.

## Visual Design

### Appearance
- **Background color**: Dark gray/black (`bg-gray-900`)
- **Text color**: White (`text-white`)
- **Font size**: Extra small (`text-xs`)
- **Padding**: Vertical: 0.375rem (6px), Horizontal: 0.625rem (10px)
- **Border radius**: 0.25rem (4px)
- **Border**: Subtle dark gray border (`border border-gray-800`)
- **Shadow**: Medium shadow for depth (`shadow-md`)
- **Arrow**: CSS border triangle that points precisely to the element
- **Animation**: Scale + fade with 150ms duration for a premium feel

### Positioning
- **Smart adaptive positioning**: Tooltips appear in the location with the most available space (top, bottom, left, right)
- **Edge detection**: Tooltips automatically adjust to stay within the viewport
- **Transform origin**: Based on placement to create natural-feeling animations
- **Z-index**: Set high (9999) to ensure tooltips appear above other elements

## Implementation

### Global Tooltip Provider

The application uses a centralized tooltip system implemented through a context provider:

```jsx
// Wrap your application with the TooltipProvider
<TooltipProvider>
  <App />
</TooltipProvider>
```

### Using Tooltips

There are three ways to add tooltips to elements:

1. **Using the FilterChip component**:
```jsx
<FilterChip
  label="Active"
  tooltipContent="Show active contacts"
  // other props...
/>
```

2. **Using the Tooltip component**:
```jsx
<Tooltip content="Helpful explanation">
  <Button>Action</Button>
</Tooltip>
```

3. **Using the withTooltip HOC**:
```jsx
const ButtonWithTooltip = withTooltip(Button, "Click to perform action");
```

### Performance Considerations

- **Single instance**: The tooltip system creates only one tooltip element that's reused
- **Smart delay**: 300ms show delay prevents tooltips appearing during casual mouse movement
- **Immediate hide**: Tooltips disappear immediately on mouse exit for a snappy feel
- **Render optimizations**: Content is only rendered when the tooltip is visible
- **CSS transitions**: Uses CSS transitions rather than JavaScript animations for better performance
- **Cleanup**: All timeout references are properly cleaned up to prevent memory leaks

## Accessibility

- **ARIA attributes**: Tooltips use appropriate ARIA attributes (`role="tooltip"`)
- **Descriptive labels**: Interactive elements with tooltips have descriptive `aria-label` attributes
- **Supplementary info**: Tooltips provide additional context but are not required for core functionality
- **Keyboard support**: Keyboard users can access tooltip information through properly labeled controls

## Best Practices

1. **Keep content concise**: Ideally ≤ 75 characters for best readability
2. **Supplementary information only**: Use tooltips to provide additional context, not for essential information
3. **Value-add content**: Ensure tooltip content adds value beyond what is already visible
4. **Know when to use alternatives**: For larger amounts of information, consider using a popover or modal instead
5. **Test on touch devices**: Ensure a good experience for mobile users by testing hover alternatives
6. **Avoid tooltip chains**: Never use tooltips that trigger other tooltips

## Technical Implementation

The tooltip system consists of the following components:

- `TooltipProvider.tsx` - Global context provider that manages tooltip state with smart positioning
- `Tooltip.tsx` - Component for wrapping elements with tooltip functionality
- Updated `FilterChip.tsx` - Uses the global tooltip provider with optimized timing 