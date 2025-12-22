# Agent Rules - Testing Process & Strategy

## Project Workflow (Two-Phase Process):
- **Phase 1 (Planning)**: Create test plan `tests/docs/test-plans/<widget>.<feature>.md` from TEMPLATE.md using bullet TC cards
- **Phase 2 (Implementation)**: Generate tests following file structure conventions for approved TC-IDs only
- **Test Execution**: Run tests with `npm run test:playwright <path-to-spec>`

## File Structure & Naming Conventions:

**Test Plans:**
- Location: `tests/docs/test-plans/<widget>.<feature>.md`
- Template: `tests/docs/test-plans/TEMPLATE.md`

**Test Specs:**
- V4/Atomic widget tests: `tests/playwright/sanity/modules/v4-tests/<feature>.test.ts`
- Legacy widget tests: `tests/playwright/sanity/modules/<widget>/<feature>.test.ts`
- Regression tests: `tests/elements-regression/tests/<feature>.test.ts`

**Support Files (MANDATORY to create/reuse):**
- Widget Page Objects: `tests/playwright/pages/widgets/<widget-name>.ts`
- Widget Selectors: `tests/playwright/selectors/<widget-name>-selectors.ts`
- Drivers: `tests/playwright/drivers/driver-factory.ts`
- Editor Helpers: `tests/playwright/pages/editor-page.ts`

## MANDATORY Test Setup Pattern

### V4/Atomic Widget Tests (REQUIRED Structure)

**ALWAYS use DriverFactory with EditorDriver. NEVER manually create WpAdminPage.**

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

  test('TC-001: Widget test', async () => {
    // Arrange
    await driver.createNewPage(true);
    const widgetId = await MyWidgetHelper.addWidget(driver.editor);
    const widget = MyWidgetHelper.createEditorWidget(driver.editor.getPreviewFrame(), widgetId);

    // Act
    await widget.someAction();

    // Assert
    await widget.expectSomeState();
  });
});
```

### WRONG Patterns (NEVER Use)

```typescript
// NEVER - Manual WpAdminPage creation
test.beforeAll(async ({ browser, apiRequests }, testInfo) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  wpAdmin = new WpAdminPage(page, testInfo, apiRequests);
  await wpAdmin.setExperiments({ ... });
});

// NEVER - Inline selectors
const SELECTORS = { container: '[data-type="widget"]' };

// NEVER - Raw locators instead of page object methods
const tab2 = tabsElement.locator('[role="tab"]').nth(1);
await tab2.click();
await expect(tab2).toHaveAttribute('aria-selected', 'true');
```

## MANDATORY: Page Object & Selector Creation

**Before writing any widget tests, you MUST create:**

### 1. Selector File
```typescript
// tests/playwright/selectors/<widget>-selectors.ts
export const MyWidgetSelectors = {
  container: '[data-e-type="my-widget"]',
  element: '[role="button"]',
  activeClass: 'is-active',
  frontend: {
    base: '.my-widget-base',
  },
} as const;
```

### 2. Page Object File
```typescript
// tests/playwright/pages/widgets/<widget>.ts
import { expect, Frame, Locator, Page } from '@playwright/test';
import { MyWidgetSelectors } from '../../selectors/my-widget-selectors';

export class MyWidgetEditor {
  constructor(private readonly frame: Frame, private readonly widgetId: string) {}
  
  get container(): Locator { return this.frame.locator(`[data-id="${this.widgetId}"]`); }
  
  async clickElement(index: number): Promise<void> { /*...*/ }
  async expectActive(index: number): Promise<void> { /*...*/ }
  async expectVisible(): Promise<void> { /*...*/ }
}

export class MyWidgetFrontend { /*...*/ }

export class MyWidgetHelper {
  static async addWidget(editor: EditorWithAddElement, containerId = 'document'): Promise<string> { /*...*/ }
  static createEditorWidget(frame: Frame, widgetId: string): MyWidgetEditor { /*...*/ }
  static createFrontendWidget(page: Page): MyWidgetFrontend { /*...*/ }
}
```

## Pre-Implementation Checklist

Before writing ANY test code:
1. [ ] Check existing selectors in `tests/playwright/selectors/`
2. [ ] Check existing page objects in `tests/playwright/pages/widgets/`
3. [ ] Create selector file if widget selectors don't exist
4. [ ] Create page object file if widget page object doesn't exist
5. [ ] Use `DriverFactory.createEditorDriver()` for test setup
6. [ ] Use page object methods instead of raw locators

## Testing Strategy & Coverage:
- **Primary Focus**: E2E scenarios with persistence & undo/redo validation when relevant
- **Test Scope**: Core functionality, edge cases, error conditions, business logic flows, accessibility, responsive design
- **Architecture**: Create Page Objects for each widget in `tests/playwright/pages/widgets/`; create selectors in `tests/playwright/selectors/`; reuse existing helpers from `editor-page.ts`
- **Conditional Controls**: Systematically probe switchers; check `.elementor-hidden-control`; delete discovery tests after validation

## Test Case Design Principles:
Design comprehensive scenarios leveraging QA expertise:
- Core functionality and happy path scenarios
- Edge cases and boundary value testing
- Error conditions and validation testing
- Business logic flows and user workflows
- Accessibility and performance considerations
- Cross-browser and responsive design scenarios
- Security and input validation testing

## Test Organization with Steps:
Use `test.step()` to organize complex test scenarios:

```typescript
test('widget full lifecycle', async ({ page, apiRequests }, testInfo) => {
  let widgetId: string;

  await test.step('Setup widget', async () => {
    // Arrange
  });

  await test.step('Verify editor display', async () => {
    // Assert editor state
  });

  await test.step('Verify frontend display', async () => {
    // Assert published state
  });
});
```

## Screenshot Guidelines:
- Maximum 5 screenshots per widget, targeted and specific
- Use `expect.soft` for non-critical visual validations
- Widget-only screenshots preferred
- RTL testing only on frontend when applicable
- Wait for UI stability before screenshots of dynamic content

## Definition of Done:
- All tests tied to approved TC-IDs and assert real acceptance criteria
- Tests pass headless locally and in CI with no console errors
- Persistence and undo/redo functionality verified (when relevant)
- Test plan's "Mapping to code" section updated
- Mark completion: `npm run mark -- --plan tests/docs/test-plans/<widget>.<feature>.md --done <TC-IDs>`

## Error Handling:
- On product-like failures, produce BUG REPORT block with: Title/Steps/Expected/Actual/TC-IDs/Notes
- Always run created tests one final time before declaring completion
- Expect additional fixes will likely be needed

## Data-Driven Testing Pattern:
For tests with multiple similar scenarios, use data arrays:

```typescript
const testData = [
  { name: 'scenario_1', input: 'value1', expected: 'result1' },
  { name: 'scenario_2', input: 'value2', expected: 'result2' },
];

test('parameterized test', async ({ page, apiRequests }, testInfo) => {
  // Setup once
  for (const { name, input, expected } of testData) {
    await test.step(`Test case: ${name}`, async () => {
      // Test each scenario
    });
  }
});
```

## Widget Test Iteration Pattern:
For testing multiple widgets with same behavior:

```typescript
const atomicWidgets = [
  { name: 'e-heading', title: 'Heading' },
  { name: 'e-button', title: 'Button' },
];

atomicWidgets.forEach((widget) => {
  test.describe(widget.name, () => {
    test('widget displays correctly', async () => {
      // Test logic for each widget
    });
  });
});
```

## Integration Points:
- Elementor-specific implementation details: see `elementor-specific.md`
- MCP usage for app behavior analysis: see `mcp-rules.md`
- Technical testing standards: see `.cursor/rules/tests-code-style.mdc`
