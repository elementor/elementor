# Base Layout Components

This directory contains the base layout components for the Import/Export Customization module, built using the modern `@elementor/ui` design system.

## Components

### BaseLayout

The main layout wrapper that provides consistent structure and theming.

**Props:**
- `children` (node, required) - Main content
- `topBarProps` (object) - Props to pass to TopBar component
- `footerProps` (object) - Props to pass to Footer component
- `showTopBar` (boolean, default: true) - Whether to show the top bar
- `showFooter` (boolean, default: false) - Whether to show the footer
- `sx` (object) - Custom styling

**Usage:**
```jsx
import { BaseLayout } from '../components/layout';

function MyPage() {
  return (
    <BaseLayout
      topBarProps={{ title: 'My Page' }}
      showFooter={true}
    >
      <div>Page content</div>
    </BaseLayout>
  );
}
```

### TopBar

Extensible top bar with three content slots: start, center, and end.

**Props:**
- `title` (string) - Main title text
- `startContent` (node) - Custom content for the start (left) section
- `centerContent` (node) - Custom content for the center section
- `endContent` (node) - Custom content for the end (right) section
- `showCloseButton` (boolean, default: false) - Whether to show close button
- `onClose` (function) - Custom close handler
- `sx` (object) - Custom styling

**Usage:**
```jsx
const topBarProps = {
  title: 'Export Kit',
  showCloseButton: true,
  endContent: (
    <Button variant="outlined">
      Help
    </Button>
  ),
};
```

### Footer

Extensible footer with three content slots or custom children.

**Props:**
- `children` (node) - Custom footer content (overrides slot system)
- `startContent` (node) - Content for the start (left) section
- `centerContent` (node) - Content for the center section
- `endContent` (node) - Content for the end (right) section
- `sx` (object) - Custom styling
- `elevation` (number, default: 1) - Material-UI elevation

**Usage:**
```jsx
// Using slot system
const footerProps = {
  startContent: <Typography>Version 1.0</Typography>,
  endContent: <Button>Save</Button>,
};

// Using custom children
const footerProps = {
  children: (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>Left content</span>
      <span>Right content</span>
    </div>
  ),
};
```

## Design Principles

1. **Extensibility**: All components support custom content injection through props
2. **Consistency**: Uses `@elementor/ui` components for consistent theming
3. **Flexibility**: Supports both structured slots and free-form content
4. **Accessibility**: Implements proper ARIA labels and semantic HTML
5. **Responsive**: Built with responsive design in mind

## Examples

See the `export/index.js` and `import/index.js` files for complete usage examples demonstrating different customization approaches. 