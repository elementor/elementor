# Atomic Mega Menu V3 - Progress & DX Findings

## Status

| Task | Status |
|------|--------|
| progress.md | Done |
| atomic-mega-menu.php (parent) | Done |
| atomic-mega-menu-nav.php | Done |
| atomic-mega-menu-item.php | Done |
| atomic-mega-menu-content-area.php | Done |
| atomic-mega-menu-panel.php | Done |
| handlers/utils.js | Done |
| handlers/atomic-mega-menu-handler.js | Done |
| handlers/atomic-mega-menu-preview-handler.js | Done |
| module.php registration | Done |
| webpack.js entries | Done |

## DX Findings & Infra Gaps

### 1. Namespace / Directory Convention is Inconsistent (Friction: Medium)

The tabs elements on `main` use a nested directory convention where each element lives in its own subdirectory with its own namespace segment:
```
atomic-tabs/atomic-tab/atomic-tab.php
  → namespace ...Atomic_Tabs\Atomic_Tab;
```

But other atomic elements (like `atomic-paragraph`) use a flat structure:
```
atomic-paragraph/atomic-paragraph.php
  → namespace ...Atomic_Paragraph;
```

This inconsistency meant I initially created flat files following the simpler pattern, then had to restructure. The skill doc doesn't mention the sub-namespace pattern at all.

**Suggestion:** Document the sub-namespace convention explicitly in the skill. Or better, pick one convention and standardize.

### 2. Render_Context Key Uses FQCN (Friction: Low, Risk: Medium)

`Render_Context::get()` uses the class FQCN as the lookup key:
```php
Render_Context::get( Atomic_Mega_Menu::class );
```

This creates a tight coupling between child and parent namespaces. If the parent class is renamed or moved, all children break silently (the context array will just be empty). There's no error or warning.

**Suggestion:** Consider using the element type string (`'e-mega-menu'`) as the context key instead, or add a validation that warns when `Render_Context::get()` returns empty.

### 3. No "Default Inactive" Pattern in Render Context (Friction: Low)

Tabs always have an active tab. The mega menu starts with nothing active (all panels hidden). The `define_render_context` pattern doesn't need any change to support this - we simply don't include a `default-active-*` key. But the skill doc and reference assume there's always an active item.

The `data-e-settings` on the parent currently passes an empty JSON object `{}` since there's no default active item. This works but feels like a gap - the handler convention expects `settings['some-key']` to exist.

**Suggestion:** Document that `data-e-settings` can be empty and handlers should handle `null` active states.

### 4. define_default_children Builder API is Ergonomic (Finding: Positive)

The builder pattern (`::generate()->editor_settings()->is_locked()->build()`) works well. The composition of items + panels into nav + content-area containers is clean and readable. No issues here.

### 5. Html_V3_Prop_Type Signature Not Obvious (Friction: Medium)

The default children for tabs use:
```php
Html_V3_Prop_Type::generate([
    'content' => String_Prop_Type::generate('Tab'),
    'children' => [],
])
```

This nested structure wasn't obvious from the skill doc, which showed the simpler `Html_Prop_Type::generate('text')`. The V3 version requires wrapping in a `content` + `children` structure. I initially used the wrong API.

**Suggestion:** Update the skill doc to show `Html_V3_Prop_Type` with the correct structure.

### 6. Alpine.js x-bind Doesn't Natively Support "Toggle" + "Hover" Dual Modes (Friction: Medium)

The tabs handler only has click behavior. The mega menu needs both click (for mobile/accessibility) and hover (for desktop). Alpine's `x-bind` object pattern handles this cleanly enough:
```js
'@click'() { this.activeItem = this.activeItem === id ? null : id; },
'@mouseenter'() { this.activeItem = id; },
```

But there's no built-in way to switch between modes (hover vs click) based on viewport or settings. The v2 mega menu had `isNeedToOpenOnClick()` logic. For V3, this would need to be handled either:
- Via a setting passed through `data-e-settings`
- Via Alpine's `$screen` or a custom directive

**Suggestion:** Consider adding a viewport-aware utility to `@elementor/alpinejs` for switching interaction modes.

### 7. "Close on Click Outside" Requires Extra Pattern (Friction: Low)

Alpine has `@click.outside` but it needs to be on the Alpine root component element. Since `x-data` is on the `<nav>` wrapper, clicking outside closes correctly. But the mouseleave is on individual panels, not the whole nav - this means the hover close behavior might feel inconsistent.

In the v2 widget, this was handled with `document.addEventListener('click', ...)` and a complex `onMouseLeave` that checked cursor position between title and content. The Alpine binding pattern doesn't naturally handle "cursor moved between item and panel" scenarios.

**Suggestion:** Document the hover gap pattern. Consider providing a shared Alpine plugin/directive for dropdown menus.

### 8. Boilerplate in add_render_attributes (Friction: High)

Every element repeats this exact pattern:
```php
parent::add_render_attributes();
$settings = $this->get_atomic_settings();
$base_style_class = $this->get_base_styles_dictionary()[ static::BASE_STYLE_KEY ];
$initial_attributes = $this->define_initial_attributes();

$attributes = [
    'class' => [
        'e-con',
        'e-atomic-element',
        $base_style_class,
        ...( $settings['classes'] ?? [] ),
    ],
];

// ...custom attributes...

$this->add_render_attribute( '_wrapper', array_merge( $initial_attributes, $attributes ) );
```

This is ~15 lines of identical code in every element. The `e-con`, `e-atomic-element`, base style class, and classes prop are always there.

**Suggestion:** Extract this into a base class method that returns the common attributes array, letting children just add their custom ones. Something like:
```php
protected function add_render_attributes() {
    $common = $this->get_common_wrapper_attributes();
    $custom = ['x-bind' => 'menuItem', ...];
    $this->add_render_attribute('_wrapper', array_merge($common, $custom));
}
```

### 9. Script Registration is Manual and Repetitive (Friction: Medium)

Each nested element parent must manually implement both `register_frontend_handlers()` and `get_script_depends()`. The handler names, paths, and dependency arrays follow a predictable pattern. This could be convention-based.

**Suggestion:** Consider a declarative approach:
```php
protected function define_frontend_handlers(): array {
    return [
        'handler' => 'atomic-mega-menu-handler.js',
        'preview-handler' => 'atomic-mega-menu-preview-handler.js',
    ];
}
```

### 10. Webpack Entry Requires Manual Modification (Friction: Low)

Adding handlers requires editing `.grunt-config/webpack.js` manually. This is expected for now but could become a maintenance burden as more nested elements are added.

## Summary

The nested elements infra is solid and the tabs pattern translates well to a mega menu. The main pain points are:
1. **Boilerplate** in `add_render_attributes` (every element repeats ~15 lines)
2. **Namespace/directory convention** inconsistency between flat and nested patterns
3. **Skill doc accuracy** - `Html_V3_Prop_Type` signature and directory conventions not documented
4. **Hover behavior** - no built-in Alpine utility for viewport-aware interaction mode switching
