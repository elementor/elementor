# Elementor-Specific Implementation Guide

## MANDATORY: DriverFactory Pattern

**ALWAYS use DriverFactory for E2E tests. NEVER manually create WpAdminPage or manage experiments.**

### Standard Test Structure (REQUIRED)

```typescript
import { parallelTest as test } from '../../../parallelTest';
import { expect } from '@playwright/test';
import { DriverFactory } from '../../../drivers/driver-factory';
import type { EditorDriver } from '../../../drivers/editor-driver';
import { MyWidgetHelper } from '../../../pages/widgets/my-widget';
import { MyWidgetSelectors } from '../../../selectors/my-widget-selectors';

test.describe('Widget Tests @v4-tests', () => {
  let driver: EditorDriver;

  test.beforeAll(async ({ browser, apiRequests }, testInfo) => {
    driver = await DriverFactory.createEditorDriver(browser, testInfo, apiRequests, {
      experiments: ['e_atomic_elements'],
    });
  });

  test.afterAll(async ({ browser, apiRequests }, testInfo) => {
    await DriverFactory.resetExperiments(browser, testInfo, apiRequests);
    await driver.close();
  });

  test('TC-001: My test', async () => {
    // Arrange
    await driver.createNewPage(true); // true = close navigator
    const widgetId = await MyWidgetHelper.addWidget(driver.editor);
    const widget = MyWidgetHelper.createEditorWidget(driver.editor.getPreviewFrame(), widgetId);

    // Act
    await widget.clickSomething();

    // Assert
    await widget.expectSomething();
  });
});
```

### WRONG Pattern (Never Use)

```typescript
// ❌ NEVER DO THIS - Manual page/experiment management
test.beforeAll(async ({ browser, apiRequests }, testInfo) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  wpAdmin = new WpAdminPage(page, testInfo, apiRequests);
  await wpAdmin.setExperiments({ ... });
  await page.close();
});
```

## MANDATORY: Page Objects for Widgets

**For any widget tests, create a page object in `tests/playwright/pages/widgets/`**

### Page Object Structure

```typescript
// tests/playwright/pages/widgets/my-widget.ts
import { expect, Frame, Locator, Page } from '@playwright/test';
import { MyWidgetSelectors } from '../../selectors/my-widget-selectors';

export class MyWidgetEditor {
  constructor(private readonly frame: Frame, private readonly widgetId: string) {}

  get container(): Locator {
    return this.frame.locator(`[data-id="${this.widgetId}"]`);
  }

  getElement(index: number): Locator {
    return this.container.locator(MyWidgetSelectors.element).nth(index);
  }

  async click(index: number): Promise<void> {
    await this.getElement(index).click();
  }

  async expectActive(index: number): Promise<void> {
    await expect(this.getElement(index)).toHaveAttribute('aria-selected', 'true');
  }

  async expectCount(count: number): Promise<void> {
    await expect(this.container.locator(MyWidgetSelectors.element)).toHaveCount(count);
  }

  async expectVisible(): Promise<void> {
    await expect(this.container).toBeVisible();
  }
}

export class MyWidgetFrontend {
  constructor(private readonly page: Page, private readonly widgetId?: string) {}

  get container(): Locator {
    if (this.widgetId) {
      return this.page.locator(`[data-id="${this.widgetId}"]`);
    }
    return this.page.locator(MyWidgetSelectors.container).first();
  }

  // Similar methods as Editor class...
}

interface EditorWithAddElement {
  addElement: (props: { elType: string }, containerId: string) => Promise<string>;
}

export class MyWidgetHelper {
  static async addWidget(editor: EditorWithAddElement, containerId = 'document'): Promise<string> {
    return await editor.addElement({ elType: 'my-widget' }, containerId);
  }

  static createEditorWidget(frame: Frame, widgetId: string): MyWidgetEditor {
    return new MyWidgetEditor(frame, widgetId);
  }

  static createFrontendWidget(page: Page, widgetId?: string): MyWidgetFrontend {
    return new MyWidgetFrontend(page, widgetId);
  }
}
```

## MANDATORY: Centralized Selectors

**NEVER define selectors inline in test files. Create selector files.**

### Selector File Structure

```typescript
// tests/playwright/selectors/my-widget-selectors.ts
export const MyWidgetSelectors = {
  container: '[data-e-type="my-widget"]',
  element: '[role="button"]',
  activeClass: 'is-active',
  
  frontend: {
    base: '.my-widget-base',
    button: '.my-widget-button',
  },

  // Helper functions for dynamic selectors
  getById: (id: string) => `[data-id="${id}"]`,
} as const;
```

## Checklist Before Writing ANY E2E Test

1. [ ] Use `DriverFactory.createEditorDriver()` in `beforeAll`
2. [ ] Use `DriverFactory.resetExperiments()` and `driver.close()` in `afterAll`
3. [ ] Create/reuse selector file in `tests/playwright/selectors/`
4. [ ] Create/reuse page object in `tests/playwright/pages/widgets/`
5. [ ] Use Helper class factory methods (not raw locators)
6. [ ] Use `driver.createNewPage(true)` instead of manual page creation
7. [ ] Follow AAA pattern with comments

## Elementor Editor API

**Canonical APIs for element creation:**
```typescript
const container = await editor.addElement({ elType: 'container' }, 'document');
const buttonId = await editor.addWidget({ widgetType: 'e-button', container });
const button = await editor.getWidget(buttonId);
const widgetSelector = editor.getWidgetSelector(buttonId);
```

**Element Selection:**
```typescript
await editor.selectElement(buttonId);
await editor.removeElementWithHandle(containerId);
```

## V4 Panel API

**Tab Navigation:**
```typescript
await editor.v4Panel.openTab('general');
await editor.v4Panel.openTab('style');
```

**Field Interaction (by index):**
```typescript
await editor.v4Panel.fillField(0, 'Button Text');
await editor.v4Panel.fillField(1, 'https://example.com');
```

**Widget Sizing:**
```typescript
await editor.v4Panel.setWidgetSize({ width: 200, height: 60 });
```

## Panel Section Navigation

**Opening collapsible sections in style tab:**
```typescript
await editor.openV2Section('layout');
await editor.openV2Section('spacing');
await editor.openV2Section('size');
await editor.openV2Section('position');
await editor.openV2Section('typography');
await editor.openV2Section('background');
await editor.openV2Section('border');
```

**Panel Tab Navigation (legacy helper):**
```typescript
await editor.openV2PanelTab('style');
await editor.openV2PanelTab('general');
```

## Common Selectors

**Panel and Elements:**
```typescript
const panelSelector = '#elementor-panel-inner';
const elementsPanel = editor.page.locator(EditorSelectors.panels.elements.elementorPanel);
const v4Elements = editor.page.locator(EditorSelectors.panels.elements.v4elements);
```

**Widget-specific selectors:**
```typescript
const widgetSelector = editor.getWidgetSelector(widgetId);
const widgetInPreview = editor.getPreviewFrame().locator(widgetSelector);
```

**Control selectors:**
```typescript
await page.locator('[aria-label="Toggle link"]').click();
await page.locator('text="Open in a new tab"').click();
const fontFamilyLabel = page.locator('label:has-text("Font family")');
```

**Section buttons:**
```typescript
const sectionButton = editor.page.locator('.MuiButtonBase-root', { hasText: /typography/i });
```

## Available Helper Functions

Reference `tests/playwright/pages/editor-page.ts` for existing helpers:

**Page Lifecycle:**
- `editor.publishAndViewPage()` - publish and navigate to frontend
- `editor.publishPage()` - publish without navigation
- `editor.viewPage()` - navigate to published page
- `editor.saveAndReloadPage()` - save and reload editor
- `editor.waitForPanelToLoad()` - wait for panel ready state

**Navigation:**
- `editor.openElementsPanel()` - open widgets panel
- `editor.closeNavigatorIfOpen()` - close navigator sidebar
- `editor.openV2PanelTab(tab)` - switch panel tabs
- `editor.openV2Section(section)` - expand panel sections

**Widget Interaction:**
- `editor.addElement(config, parent)` - add container/section
- `editor.addWidget(config)` - add widget to container
- `editor.getWidget(id)` - get widget locator
- `editor.getWidgetSelector(id)` - get CSS selector
- `editor.selectElement(id)` - select element in editor
- `editor.removeElementWithHandle(id)` - delete element

**Preview Frame:**
- `editor.getPreviewFrame()` - access iframe content
- `editor.isUiStable(locator)` - wait for UI stability (useful for YouTube, etc.)

**Styling:**
- `editor.setBackgroundColorControlValue()` - set background color

## Widget Types & Experiments

**Atomic/v4 Widgets:**
- Require experiments: `e_opt_in_v4_page`, `e_atomic_elements`
- Located in 'Atomic Elements' section
- Use `editor.v4Panel.*` methods for interaction
- Available widgets: `e-heading`, `e-image`, `e-paragraph`, `e-svg`, `e-button`, `e-divider`, `e-youtube`

**Legacy Widgets:**
- Found in 'Layout', 'Basic', 'Pro', 'General', 'Link in Bio', 'Site', 'Single' sections
- Have separate 'Style' and 'Advanced' tabs for styling
- Use `editor.openV2PanelTab()` for navigation

## Test Step Usage

**Organize complex tests with steps:**
```typescript
test('Widget lifecycle test', async ({ page, apiRequests }, testInfo) => {
  let buttonId: string;
  
  await test.step('Setup the widget', async () => {
    const wpAdmin = new WpAdminPage(page, testInfo, apiRequests);
    const editor = await wpAdmin.openNewPage();
    await editor.closeNavigatorIfOpen();
    const container = await editor.addElement({ elType: 'container' }, 'document');
    buttonId = await editor.addWidget({ widgetType: 'e-button', container });
  });

  await test.step('Verify editor display', async () => {
    const button = await editor.getWidget(buttonId);
    await expect(button).toBeVisible();
  });

  await test.step('Verify frontend display', async () => {
    await editor.publishAndViewPage();
    // frontend assertions...
  });
});
```

## Elementor-Specific Constants

```typescript
import { viewportSize } from '../../../enums/viewport-sizes';

const viewportSizes = {
  desktop: viewportSize.desktop,
  tablet: viewportSize.tablet,
  mobile: viewportSize.mobile
};

const BACKGROUND_COLORS = ['#FF5722', '#2196F3'];
const BORDER_WIDTHS = { thin: 1, medium: 3, thick: 5 };
```

## Responsive Testing Strategy

- Test all three breakpoints: desktop, tablet, mobile
- Use existing viewport size constants from `enums/viewport-sizes`
- Test conditional controls that appear/hide based on breakpoints
- Verify responsive behavior in both editor and frontend

## Screenshot Best Practices

```typescript
// Widget-only screenshot
await expect.soft(editor.page.locator(widgetSelector)).toHaveScreenshot('widget-editor.png');

// Panel screenshot
await expect.soft(editor.page.locator('#elementor-panel-inner')).toHaveScreenshot('panel-state.png');

// Frontend container screenshot
const containerSelector = editor.getWidgetSelector(containerId);
await expect.soft(editor.page.locator(containerSelector)).toHaveScreenshot('widget-published.png');

// Wait for stability before screenshot (dynamic content like YouTube)
await editor.isUiStable(editor.page.locator(containerSelector));
await expect.soft(editor.page.locator(containerSelector)).toHaveScreenshot('dynamic-widget.png');
```
