# Elementor-Specific Implementation Guide

## Elementor Editor API
**Canonical APIs for element creation:**
```javascript
// Create elements using official APIs
const container = await editor.addElement({ elType: 'container' }, 'document');
const buttonId = await editor.addWidget({ widgetType: 'e-button', container });

// Communicate with widgets using their IDs
const button = await editor.getWidget(buttonId);
```

**Panel Navigation - Use existing helper methods:**
```javascript
// Correct - use existing helpers
await editor.openV2PanelTab('style');
await editor.openV2Section('size');

//  Avoid - manual tab clicking
await editor.page.getByRole('tab', { name: 'Style' }).click();
```

## Widget Types & Experiments
**Atomic/v4/v2 Widgets:**
- Require experiments: `e_opt_in_v4_page: 'active'`, `e_atomic_elements: 'active'`
- Located in 'Atomic Elements' section
- Have single 'Style' tab with all styling options

**Legacy Widgets:**
- Found in 'Layout', 'Basic', 'Pro', 'General', 'Link in Bio', 'Site', 'Single' sections  
- Have separate 'Style' and 'Advanced' tabs for styling

## Control Interaction Examples
```javascript
// Link control example
const linkUrl = 'https://example.com';
await editor.openV2PanelTab('general');
await page.locator('[aria-label="Toggle link"]').click();
await editor.v4Panel.fillField(1, linkUrl);
```

## Available Helper Functions
Reference `tests/playwright/pages/editor-page.ts` for existing helpers:
- `editor.setBackgroundColorControlValue()` - handles visibility checks
- `editor.publishAndViewPage()` - consistent frontend navigation
- `editor.openV2PanelTab()` - panel navigation
- `editor.openV2Section()` - section navigation

## Elementor-Specific Constants
```javascript
// Use existing enums for responsive testing
const viewportSizes = {
  desktop: viewportSize.desktop,
  tablet: viewportSize.tablet, 
  mobile: viewportSize.mobile
};

// Define control values as named constants
const BACKGROUND_COLORS = ['#FF5722', '#2196F3'];
const BORDER_WIDTHS = { thin: 1, medium: 3, thick: 5 };
```

## Responsive Testing Strategy
- Test all three breakpoints: desktop, tablet, mobile automatically
- Use existing viewport size constants
- Test conditional controls that appear/hide based on breakpoints
- Verify responsive behavior in both editor and frontend 