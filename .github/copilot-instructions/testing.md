# Testing Best Practices

## General Testing Principles

### Ensure Tests Pass After Refactoring
- Tests can be run using `composer run test`
- Whenever you make changes to a PHP file, ensure tests are passing
- Run tests after each significant change
- Fix failing tests before moving to next changes

### Test Structure
- Write tests for critical paths only
- Use AAA structure (Arrange, Act, Assert)
- Use clear, self-explanatory naming
- Keep test files small and focused

---

## Test Organization

### Reduce Code Duplication
- Extract repeated code into helper methods or setup functions
- Move common mocks and assertions to shared helpers
- Use setup/teardown methods for common initialization

### Example
✅ **Good**:
```php
class Widget_Test extends TestCase {
    private $widget;
    private $mock_settings;
    
    protected function setUp(): void {
        parent::setUp();
        $this->mock_settings = $this->create_mock_settings();
        $this->widget = new Widget( $this->mock_settings );
    }
    
    private function create_mock_settings() {
        return [
            'title' => 'Test Title',
            'content' => 'Test Content',
        ];
    }
    
    public function test_render_with_title() {
        $output = $this->widget->render();
        $this->assertStringContainsString( 'Test Title', $output );
    }
}
```

❌ **Bad**:
```php
class Widget_Test extends TestCase {
    public function test_render_with_title() {
        $settings = [
            'title' => 'Test Title',
            'content' => 'Test Content',
        ];
        $widget = new Widget( $settings );
        $output = $widget->render();
        $this->assertStringContainsString( 'Test Title', $output );
    }
    
    public function test_render_with_content() {
        $settings = [
            'title' => 'Test Title',
            'content' => 'Test Content',
        ];
        $widget = new Widget( $settings );
        $output = $widget->render();
        $this->assertStringContainsString( 'Test Content', $output );
    }
}
```

### Follow Directory Structure
- Mirror the structure of the folders for the class being tested
- Example: If testing a class in `classes/widgets`, put the test in `tests/phpunit/classes/widgets`

---

## Playwright Testing Best Practices

### Experiments
- **Do not globally modify experiments**
- Tests should run with the default experiment status per product version
- Test experiments inside a specific test, not globally
- Always reset experiments after testing an experimental feature
- Only reset experiments if your test modifies them

Example:
```typescript
await resetExperiments();
await setExperiments( { e_font_icon_svg: 'active', container: 'active' } );
```

---

## Playwright General Guidelines

### 1. Create Small, Readable Tests
Use test steps when needed:

```typescript
test( 'Copy Paste widget test', async ( { page }, testInfo ) => {
    const editorPage = new EditorPage( page, testInfo );
    const wpAdminPage = new WpAdminPage( page, testInfo );
    const contextMenu = new ContextMenu( page, testInfo );
    
    await wpAdminPage.openNewPage();
    await editorPage.addWidget( 'heading' );
    await page.locator( EditorSelectors.widgetsPanelIcon ).click();
    await contextMenu.selectWidgetContextMenuItem( 'heading', 'Copy' );
    await contextMenu.selectWidgetContextMenuItem( 'heading', 'Paste' );
    
    expect( await contextMenu.editorPage.getWidgetCount() ).toBe( 2 );
} );
```

### 2. Wrap Playwright Commands in Helper Functions

❌ **Bad**:
```typescript
await page.locator( '.tab-control-style' ).click();
await page.locator( '.control-icon_section_style' ).click();
await page.locator( '.control-icon_size [data-setting="size"]' ).first().fill( '50' );
```

✅ **Good**:
```typescript
await contextMenu.selectWidgetContextMenuItem( 'heading', 'Copy' );
```

### 3. Use Page Objects
- Keep functions in helpers under `playwright/pages` instead of inline in tests
- Create reusable page objects for common functionality

### 4. Avoid Duplication
- When a locator/URL is used more than once, create variables with meaningful names
- Place locators in appropriate files

### 5. Keep Test Files Small
- Split large tests into helpers
- More than one `describe` in a test file is a signal to split files

### 6. Use Data-Driven Approach

❌ **Bad**:
```typescript
await test.step( 'Check title <h3> text and icon alignment', async () => {
    const tag = 'h3';
    await frame.waitForLoadState( 'load' );
    await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
    await expectScreenshotToMatchLocator( `nested-accordion-title-${tag}-alignment.png`, nestedAccordionTitle );
} );
// repeated for h4, h5...
```

✅ **Good**:
```typescript
for ( const tag of [ 'h3', 'h4', 'h5' ] ) {
    await test.step( `Check title ${tag} text and icon alignment`, async () => {
        await frame.waitForLoadState( 'load' );
        await setTitleTextTag( tag, nestedAccordionWidgetId, editor, page );
        await expectScreenshotToMatchLocator( `nested-accordion-title-${tag}-alignment.png`, nestedAccordionTitle );
    } );
}
```

### 7. Prefer Explicit Waits

❌ **Bad**:
```typescript
await page.waitForTimeout( 1000 );
```

✅ **Good**:
```typescript
await page.locator( '.superButton' ).waitFor();
```

### 8. Create Test Data via REST API
- Create test data (users, entities, WordPress content) via REST API when possible
- Reference: [REST API Handbook](https://developer.wordpress.org/rest-api/)

### 9. Store Large Test Data Separately
- Store large test data in separate files
- Import in tests or hooks

### 10. Enable ESLint
- Enable ESLint and auto-format on save
- Ensure IDE uses the repo's `.eslintrc.js`

### 11. Use Playwright's Auto-Retrying Assertions
- Reference: [Playwright Assertions](https://playwright.dev/docs/test-assertions)

### 12. Use TypeScript with Types

❌ **Bad**:
```typescript
async function myFunction( page ) {
    await page.thisMethodNeverExist();
}
```

✅ **Good**:
```typescript
async function myFunction( page: Page ) {
    await page.goto( 'https://example.com' );
}
```

### 13. Test Visual Output, Not Styles
- Do not test styles with Playwright
- Use screenshot comparison to test what the user sees

```typescript
await expect.soft( page.locator( '.superBtn' ) ).toHaveScreenshot( 'superBtn.png' );
```

### 14. Use CI Screenshots
- Create a test requiring a screenshot and run locally with `toHaveScreenshot`
- Test will fail on first comparison
- Download results from CI summary
- Find the `*-actual.jpeg` image, ensure it's expected
- Rename to `*-linux.jpeg`
- Commit the CI screenshot in your PR
- Do not push local machine screenshots to CI

---

## Test Timing Guidelines

### Performance
- A good test should run in < 25 seconds
- Tests > 90 seconds will fail by timeout
- The full test run should complete in < 10 minutes on CI

---

## Test Data Management

### Mock Data
- Create realistic mock data
- Use factories for complex object creation
- Keep mock data maintainable and reusable

### Test Isolation
- Each test should be independent
- Clean up after tests
- Don't rely on test execution order

