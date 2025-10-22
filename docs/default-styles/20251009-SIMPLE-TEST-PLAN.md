# Simple Test Plan - Base Class Renaming

**When to run**: After reactivating elementor-css plugin

---

## ✅ **Quick Manual Test** (2 minutes)

### **Step 1: Create Widget via API**

```bash
curl -X POST "http://elementor.local:10003/wp-json/elementor-css/v1/widgets" \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<h1>Test Heading</h1>",
    "css": "h1 { color: red; }",
    "useZeroDefaults": true
  }'
```

### **Step 2: Check Debug Logs**

```bash
tail -50 /path/to/wp-content/debug.log | grep "ELEMENTOR_CSS"
```

**Expected Output**:
```
🔥🔥🔥 ELEMENTOR_CSS: get_base_styles_dictionary called for e-heading
🔥🔥🔥 ELEMENTOR_CSS: is_registration_context = FALSE
🔥🔥🔥 ELEMENTOR_CSS: ✅ CSS CONVERTER DETECTED via disable_base_styles flag!
🔥🔥🔥 ELEMENTOR_CSS: ✅ Added -converted suffix: e-heading-base-converted
🔥🔥🔥 ELEMENTOR_CSS: Final base_styles_dictionary: {"base":"e-heading-base-converted"}
```

---

## 🔧 **WP-CLI Test** (1 minute)

```bash
cd /Users/janvanvlastuin1981/Local\ Sites/elementor/app/public

wp eval '
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Conversion_Service;

$service = new Widget_Conversion_Service( true );
$result = $service->convert_from_strings( "<h1>Test</h1>", "h1 { color: red; }" );

$widget_data = $result["widgets"][0];
$widget_manager = \Elementor\Plugin::instance()->widgets_manager;
$widget_instance = $widget_manager->create_widget_instance( $widget_data );

$base_styles = $widget_instance->get_base_styles_dictionary();

foreach ( $base_styles as $key => $class ) {
    $has_suffix = ( strpos( $class, "-converted" ) !== false ) ? "✅" : "❌";
    echo "{$has_suffix} {$key} => {$class}\n";
}
'
```

**Expected Output**:
```
✅ base => e-heading-base-converted
```

---

## 🎭 **Playwright Test**

### **Test File**: `tests/playwright/sanity/modules/css-converter/default-styles/base-class-renaming.test.ts`

```typescript
test('should add -converted suffix to base classes', async ({ page }) => {
    // Create widget via API
    const result = await convertWidgetAPI({
        html: '<h1>Test Heading</h1>',
        css: 'h1 { color: red; }',
        useZeroDefaults: true
    });

    // Open editor
    await page.goto('/wp-admin/post-new.php?post_type=page');
    const editorFrame = page.frameLocator('#elementor-preview-iframe');

    // Insert widget
    await insertWidget(page, result.widgets[0]);

    // Check editor preview has -converted class
    const heading = editorFrame.locator('.e-heading-base-converted');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Test Heading');

    // Save and view frontend
    await page.click('[data-elementor-save]');
    await page.waitForLoadState('networkidle');
    
    const pageId = await page.url().match(/post=(\d+)/)?.[1];
    await page.goto(`/?p=${pageId}`);

    // Check frontend has -converted class
    const frontendHeading = page.locator('.e-heading-base-converted');
    await expect(frontendHeading).toBeVisible();
    await expect(frontendHeading).toHaveText('Test Heading');
});
```

---

## 🐛 **What to Check**

### **✅ Success Indicators**:
1. Debug logs show `-converted` suffix being added
2. `is_registration_context = FALSE` in logs
3. `CSS CONVERTER DETECTED` in logs
4. WP-CLI test shows `✅` for class names
5. Playwright tests find `.e-heading-base-converted` in DOM

### **❌ Failure Indicators**:
1. `is_registration_context = TRUE` during widget rendering
2. `NOT a CSS converter widget` in logs
3. Class names don't have `-converted` suffix
4. `editor_settings` is empty in logs
5. Playwright tests can't find `-converted` classes

---

## 🔍 **Debugging Steps**

If tests fail:

### **1. Check editor_settings Preservation**
```bash
wp eval '
$widget_data = ["widgetType" => "e-heading", "editor_settings" => ["disable_base_styles" => true]];
$widget = \Elementor\Plugin::instance()->widgets_manager->create_widget_instance( $widget_data );

$reflection = new ReflectionClass( $widget );
$prop = $reflection->getProperty( "editor_settings" );
$prop->setAccessible( true );
$settings = $prop->getValue( $widget );

echo json_encode( $settings, JSON_PRETTY_PRINT );
'
```

**Expected**: Should show `{"disable_base_styles": true}`

### **2. Check Context Detection**
Add this to `get_base_styles_dictionary()` before line 50:
```php
error_log( "🔥 WIDGET DATA: " . json_encode( $this->get_data() ) );
```

**Expected**: Should show widget data with ID during rendering

### **3. Check Detection Logic**
```bash
wp eval '
$widget_data = ["widgetType" => "e-heading", "editor_settings" => ["disable_base_styles" => true]];
$widget = \Elementor\Plugin::instance()->widgets_manager->create_widget_instance( $widget_data );

// Call is_css_converter_widget indirectly via get_base_styles_dictionary
$result = $widget->get_base_styles_dictionary();
'
```

Check logs for `CSS CONVERTER DETECTED` message.

---

## 📊 **Test Matrix**

| Context | editor_settings | Expected Result |
|---------|----------------|-----------------|
| Registration | Empty | `e-heading-base` (no suffix) |
| Runtime (standard) | Not set | `e-heading-base` (no suffix) |
| Runtime (CSS converter) | `disable_base_styles=true` | `e-heading-base-converted` ✅ |

---

## ⚡ **Quick Validation Checklist**

After reactivating elementor-css:

- [ ] Plugin activates without errors
- [ ] API endpoint responds (curl test)
- [ ] Debug logs show context detection
- [ ] WP-CLI test shows `-converted` suffix
- [ ] Editor preview shows `-converted` classes (manual check)
- [ ] Frontend shows `-converted` classes (manual check)
- [ ] Playwright tests pass

---

**Estimated Testing Time**: 5-10 minutes for full validation

