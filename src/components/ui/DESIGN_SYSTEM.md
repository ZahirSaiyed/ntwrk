# Node Design System

This document outlines the design principles, component usage guidelines, and visual style standards for the Node application.

## 🎨 Core Design Principles

1. **Clarity over decoration** - UI elements should clearly communicate their purpose and state
2. **Consistency across all interfaces** - Maintain visual and interaction consistency
3. **Accessibility as a requirement** - All components must meet WCAG AA standards
4. **Minimal learning curve** - Users should intuitively understand how to use the interface
5. **Responsive to all devices** - Components adapt gracefully to different screen sizes

## 🧩 Component Architecture

The design system is built on reusable components organized into these categories:

- **Foundations** - Theme, colors, typography, spacing, and animation
- **UI Components** - Buttons, inputs, filters, cards, and other basic elements
- **Patterns** - Common UI patterns and more complex components
- **Pages** - Full page templates and layouts

## 🎭 Visual Design Elements

### Colors

- **Primary**: #1E1E3F - Used for primary actions, key UI elements, and branding
- **Secondary**: #F4F4FF - Used for backgrounds, hover states, and secondary elements
- **Neutrals**: Various gray shades for text, backgrounds, and borders
- **Feedback**: Red, yellow, green, blue for notifications and status indicators

### Typography

- **Font**: System fonts for better performance and native feel
- **Scale**: Based on 4px grid with modular scale for harmonious proportions
- **Weights**: Regular, Medium, and Bold for visual hierarchy

### Spacing

- Based on 8px grid system (4, 8, 16, 24, 32, 48px)
- Consistent padding and margins to create visual rhythm

## 📏 Component Guidelines

### Icons

- **Standard Library**: Lucide React provides the icon set for consistency
- **Sizing**: 16px, 20px, 24px based on context
- **Use Case**: Icons should enhance understanding, not replace text
- **Accessibility**: Always include aria-labels for screen readers

### Buttons

1. **Primary Button**
   - Used for main actions and CTAs
   - Filled background with white text
   - Example: "Create Group", "Save Changes"

2. **Secondary Button**
   - Used for alternative actions
   - Outlined style with colored text
   - Example: "Cancel", "Back"

3. **Tertiary Button**
   - Used for less prominent actions
   - Text-only with hover state
   - Example: "Learn More", "View Details"

4. **Danger Button**
   - Used for destructive actions
   - Red color to indicate caution
   - Example: "Delete", "Remove"

### Filter Chips

- Used for applying filters or toggles
- Clear selected/unselected states
- Should include visual feedback on hover/focus
- Can include icons and count badges

## 🚫 Anti-patterns

These patterns should be avoided:

1. **Emoji as functional icons** - Emojis should be used as decorative elements only, not for functional UI
2. **Ambiguous states** - Selected/unselected states should be visually distinct
3. **Inconsistent styling** - Don't mix styling patterns across similar components
4. **Low contrast text** - All text should have sufficient contrast for readability
5. **Missing focus states** - All interactive elements need clear focus indicators

## 🔄 Usage Examples

### Button Examples

```jsx
// Primary Button
<Button variant="primary">Save Changes</Button>

// Secondary Button
<Button variant="secondary" icon="ArrowLeft" iconPosition="left">Back</Button>

// Tertiary Button
<Button variant="tertiary">Cancel</Button>

// Danger Button
<Button variant="danger" icon="Trash2" iconPosition="right">Delete</Button>

// Icon Button
<IconButton icon="Plus" label="Add item" />
```

### FilterChip Examples

```jsx
// Basic Filter
<FilterChip 
  label="Active" 
  selected={filter === 'active'}
  onClick={() => setFilter('active')} 
/>

// Filter with Icon
<FilterChip 
  label="Recent" 
  icon="Clock"
  selected={filter === 'recent'}
  onClick={() => setFilter('recent')} 
/>

// Filter with Count Badge
<FilterChip 
  label="Unread" 
  badge={5}
  selected={filter === 'unread'}
  onClick={() => setFilter('unread')} 
/>
```

## 🚀 Implementation Roadmap

1. **Phase 1** - Core components (Button, Icon, FilterChip)
2. **Phase 2** - Form elements and data display components
3. **Phase 3** - Layout components and responsive patterns
4. **Phase 4** - Advanced components (data visualization, etc.)

## 🧪 Testing Standards

- Components should have proper keyboard navigation
- Color contrast should meet WCAG AA standards (4.5:1 for normal text)
- All interactive elements should have appropriate focus states
- Components should be tested across different browsers and devices

---

This design system is a living document and will evolve as the application grows. 