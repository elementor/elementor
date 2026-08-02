# Packages Map

> Audience: internal
> Module: (cross-cutting)
> Status: final
> Related: [overview.md](overview.md), [../editor-packages/core-packages.md](../editor-packages/core-packages.md)

## What it is

A lookup table mapping v4 **docs areas** to **PHP module paths**, **Editor V2 JS packages**, and **test locations**. Use this when you know the feature name and need to find the code or tests.

**Registration over enumeration:** this table is a **snapshot** of current built-in registrations. To add a new package or element, follow the registration hooks documented in each row's Extension column — do not treat this as the authoritative list of what *can* exist.

## When to use it

- "Where is global classes editor UI?" → `editor-global-classes` package.
- "Which PHP file registers `e-flexbox`?" → `atomic-widgets/elements/flexbox/`.
- "Where do I add tests?" → see Tests column.

## Key concepts

### Module ↔ package overview

| Docs area | PHP module | Experiment(s) | JS package(s) | Package filter |
|-----------|-----------|---------------|---------------|----------------|
| Atomic widgets | `modules/atomic-widgets/` | `e_atomic_elements` | See atomic-widgets table below | `atomic-widgets/module.php` |
| Global classes | `modules/global-classes/` | `e_classes` + `e_atomic_elements` | `editor-global-classes` | `global-classes/module.php` |
| Variables | `modules/variables/` | `e_variables` + `e_atomic_elements` | `editor-variables` | `variables/hooks.php` |
| Interactions | `modules/interactions/` | `e_interactions` + `e_atomic_elements` | `editor-interactions` *(via atomic-widgets PACKAGES)* | atomic-widgets filter |
| Components | `modules/components/` | `e_components` + `e_atomic_elements` | `editor-components` | `components/module.php` |
| Dynamic tags | `modules/atomic-widgets/dynamic-tags/` + `modules/dynamic-tags/` | `e_atomic_elements` | *(bridge in atomic-widgets)* | — |
| MCP (PHP) | `modules/mcp/abilities/*` | *(none)* | — | — |
| MCP (in-editor JS) | — | *(none — `editor_mcp` registered but not enforced)* | `editor-mcp`, `elementor-mcp-common` | `Editor_Loader::EXTENSIONS` |
| Fundamentals libs | — | — | `editor-props`, `editor-styles`, `editor-controls`, `editor-elements`, `editor-responsive`, `schema` | atomic-widgets filter (partial) |

### atomic-widgets: PACKAGES constant

From `modules/atomic-widgets/module.php` `PACKAGES`:

| JS package | Role | NPM path |
|------------|------|----------|
| `editor-canvas` | Canvas rendering, drag-drop, style commands | `packages/core/editor-canvas` |
| `editor-controls` | Control components (lib; TODO: register-only) | `packages/libs/editor-controls` |
| `editor-editing-panel` | Style/settings panel UI | `packages/core/editor-editing-panel` |
| `editor-elements` | Element type registry (lib; TODO: register-only) | `packages/libs/editor-elements` |
| `editor-props` | PropValue validation/types (lib; TODO: register-only) | `packages/libs/editor-props` |
| `editor-styles` | Style schema utilities (lib; TODO: register-only) | `packages/libs/editor-styles` |
| `editor-styles-repository` | Style variant storage/sync | `packages/core/editor-styles-repository` |
| `editor-interactions` | Interactions tab UI | `packages/core/editor-interactions` |
| `editor-templates` | Template library integration | `packages/core/editor-templates` |
| `editor-design-system` | Design system panel | `packages/core/editor-design-system` |

### atomic-widgets: registered elements (snapshot)

From `register_elements()` in `module.php`:

| Type key | PHP class | Notes |
|----------|-----------|-------|
| `e-div-block` | `Div_Block` | |
| `e-flexbox` | `Flexbox` | Default v4 container when opted in |
| `e-grid` | `Grid` | |
| `e-tabs` | `Atomic_Tabs` | |
| `e-tabs-menu` | `Atomic_Tabs_Menu` | |
| `e-tab` | `Atomic_Tab` | |
| `e-tabs-content-area` | `Atomic_Tabs_Content_Area` | |
| `e-tab-content` | `Atomic_Tab_Content` | |
| `e-form` | `Atomic_Form` | Pro + `e_pro_atomic_form` experiment |
| `e-form-success-message` | `Form_Success_Message` | Pro + `e_pro_atomic_form` |
| `e-form-error-message` | `Form_Error_Message` | Pro + `e_pro_atomic_form` |
| `e-form` (promotion) | `Atomic_Form_Promotion` | Free sites |
| `e-collection-loop` | `Collection_Loop_Promotion` | Free sites |

### atomic-widgets: registered widgets (snapshot)

From `register_widgets()` in `module.php`:

| Type key | PHP class |
|----------|-----------|
| `e-heading` | `Atomic_Heading` |
| `e-image` | `Atomic_Image` |
| `e-paragraph` | `Atomic_Paragraph` |
| `e-svg` | `Atomic_Svg` |
| `e-button` | `Atomic_Button` |
| `e-youtube` | `Atomic_Youtube` |
| `e-divider` | `Atomic_Divider` |
| `e-self-hosted-video` | `Atomic_Self_Hosted_Video` |

### Other module packages

| Module | PACKAGES constant | Additional JS |
|--------|-------------------|---------------|
| `global-classes` | `editor-global-classes` | — |
| `variables` | `editor-variables` (in `Hooks::PACKAGES`) | — |
| `components` | `editor-components` | — |
| `interactions` | *(none via filter)* | Legacy handles: `elementor-interactions`, `elementor-editor-interactions`, `motion-js` |

Interactions PHP enqueues frontend/editor scripts directly (`modules/interactions/module.php`); the `editor-interactions` v2 package is bundled through atomic-widgets.

### Editor loader base packages

`core/editor/loader/editor-loader.php`:

- **LIBS:** `editor-responsive`, `schema`, `locations`, `elementor-mcp-common`, …
- **EXTENSIONS:** `editor-mcp`, `elementor-v3-mcp`, `elementor-kit-mcp`, `editor-panels`, …

### Tests locations (snapshot)

| Area | PHP unit tests | JS package tests |
|------|---------------|------------------|
| Atomic widgets | `tests/phpunit/elementor/modules/atomic-widgets/` | `packages/packages/core/editor-canvas/src/__tests__/` |
| Global classes | `tests/phpunit/elementor/modules/global-classes/` | `packages/packages/core/editor-global-classes/src/` |
| Variables | `tests/phpunit/elementor/modules/variables/` | `packages/packages/core/editor-variables/src/` |
| Interactions | `tests/phpunit/elementor/modules/interactions/` | `packages/packages/core/editor-interactions/src/` |
| Components | `tests/phpunit/elementor/modules/components/` | `packages/packages/core/editor-components/src/` |
| MCP abilities | `tests/phpunit/elementor/modules/mcp/` | `packages/packages/libs/editor-mcp/src/` |
| CSS converter | `tests/phpunit/elementor/modules/atomic-widgets/css-converter/` | `packages/packages/core/editor-canvas/src/mcp/utils/__tests__/` |
| Editor loader | `tests/phpunit/elementor/core/editor/loader/` | — |

Playwright E2E: `tests/playwright/sanity/modules/v4-tests/`, `atomic-widgets/`, `atomic-opt-in/`.

## Extension

### Add a new editor package

```php
// In your PHP module:
const PACKAGES = [ 'editor-your-feature' ];

add_filter( 'elementor/editor/v2/packages', fn( $packages ) => array_merge( $packages, self::PACKAGES ) );
```

```typescript
// packages/packages/core/editor-your-feature/src/init.ts
export function init() { /* register locations, tools */ }
```

See [../editor-packages/extending-editor.md](../editor-packages/extending-editor.md).

### Add a new atomic element/widget

```php
// Register in atomic-widgets or your plugin:
$widgets_manager->register( new My_Atomic_Widget() );
// or
$elements_manager->register_element_type( new My_Atomic_Element() );
```

Extend `Atomic_Widget_Base` or `Atomic_Element_Base`. See [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md).

## Internals

### Filter chain for packages

```
Editor_Loader::get_packages_to_enqueue()
  → apply_filters( 'elementor/editor/packages', EXTENSIONS )
  → apply_filters( 'elementor/editor/v1/packages', … )
  → apply_filters( 'elementor/editor/v2/packages', … )  ← modules append here
  → merged with LIBS for script registration
```

Modules only control the v2 filter additions; base EXTENSIONS are hardcoded in `Editor_Loader`.

### elementor-capabilities-mcp

`modules/elementor-capabilities-mcp/module.php` registers admin-side packages including `editor-mcp` and `elementor-mcp-common` for capabilities UI — separate from editor loader but shares package names.

### Dynamic tags bridge

v3 tags: `modules/dynamic-tags/`. v4 atomic binding: `modules/atomic-widgets/dynamic-tags/` (`Dynamic_Tags_Module`, `Dynamic_Prop_Type`). No dedicated editor package; canvas/editing-panel consume dynamic prop types through editor-props.

## See also

- [overview.md](overview.md)
- [data-flow.md](data-flow.md)
- [../editor-packages/overview.md](../editor-packages/overview.md)
- [../editor-packages/core-packages.md](../editor-packages/core-packages.md)
- [../atomic-widgets/elements-catalog.md](../atomic-widgets/elements-catalog.md)
- `packages/docs/architecture.md`
