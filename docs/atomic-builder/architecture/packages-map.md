# Packages Map

> Audience: internal
> Module: (cross-cutting)
> Related: [overview.md](overview.md), [../editor-packages/core-packages.md](../editor-packages/core-packages.md)

## What it is

Lookup table mapping v4 **docs areas** to **PHP modules**, **Editor V2 JS packages**, and **tests**. A snapshot of current built-in registrations — extend via hooks, not by editing this table.

## When to use it

- "Where is global classes editor UI?" → `editor-global-classes`
- "Which PHP file registers `e-flexbox`?" → `atomic-widgets/elements/flexbox/`
- "Where do I add tests?" → Tests column

## Key concepts

### Module ↔ package overview

| Docs area | PHP module | Experiment | JS package(s) | Filter location |
|-----------|-----------|------------|---------------|-----------------|
| Atomic widgets | `modules/atomic-widgets/` | `e_atomic_elements` | See table below | `atomic-widgets/module.php` |
| Global classes | `modules/global-classes/` | `e_atomic_elements` | `editor-global-classes` | `global-classes/module.php` |
| Variables | `modules/variables/` | `e_atomic_elements` | `editor-variables` | `variables/hooks.php` |
| Interactions | `modules/interactions/` | `e_atomic_elements` | `editor-interactions` *(via atomic-widgets)* | atomic-widgets filter |
| Components | `modules/components/` | `e_atomic_elements` | `editor-components` | `components/module.php` |
| Dynamic tags | `atomic-widgets/dynamic-tags/` + `modules/dynamic-tags/` | `e_atomic_elements` | *(bridge)* | — |
| MCP (PHP) | `modules/mcp/abilities/*` | *(none)* | — | — |
| MCP (in-editor) | — | *(none)* | `editor-mcp`, `elementor-mcp-common` | `Editor_Loader::EXTENSIONS` |
| Fundamentals libs | — | — | `editor-props`, `editor-styles`, … | atomic-widgets filter |

### atomic-widgets: PACKAGES

| JS package | Role | NPM path |
|------------|------|----------|
| `editor-canvas` | Canvas, drag-drop, style commands | `packages/core/editor-canvas` |
| `editor-controls` | Control components (lib) | `packages/libs/editor-controls` |
| `editor-editing-panel` | Style/settings panel | `packages/core/editor-editing-panel` |
| `editor-elements` | Element type registry (lib) | `packages/libs/editor-elements` |
| `editor-props` | PropValue validation/types (lib) | `packages/libs/editor-props` |
| `editor-styles` | Style schema utilities (lib) | `packages/libs/editor-styles` |
| `editor-styles-repository` | Style variant storage | `packages/core/editor-styles-repository` |
| `editor-interactions` | Interactions tab UI | `packages/core/editor-interactions` |
| `editor-templates` | Template library | `packages/core/editor-templates` |
| `editor-design-system` | Design system panel | `packages/core/editor-design-system` |

### Registered elements (snapshot)

| Type key | PHP class |
|----------|-----------|
| `e-div-block` | `Div_Block` |
| `e-flexbox` | `Flexbox` |
| `e-grid` | `Grid` |
| `e-tabs`, `e-tabs-menu`, `e-tab`, `e-tabs-content-area`, `e-tab-content` | Tabs family |
| `e-form` (+ success/error messages) | Pro + `e_pro_atomic_form` |

### Registered widgets (snapshot)

`e-heading`, `e-image`, `e-paragraph`, `e-svg`, `e-button`, `e-youtube`, `e-divider`, `e-self-hosted-video`

### Tests locations

| Area | PHP | JS |
|------|-----|-----|
| Atomic widgets | `tests/phpunit/elementor/modules/atomic-widgets/` | `packages/core/editor-canvas/src/__tests__/` |
| Global classes | `tests/phpunit/elementor/modules/global-classes/` | `packages/core/editor-global-classes/src/` |
| Variables | `tests/phpunit/elementor/modules/variables/` | `packages/core/editor-variables/src/` |
| Interactions | `tests/phpunit/elementor/modules/interactions/` | `packages/core/editor-interactions/src/` |
| Components | `tests/phpunit/elementor/modules/components/` | `packages/core/editor-components/src/` |
| MCP | `tests/phpunit/elementor/modules/mcp/` | `packages/libs/editor-mcp/src/` |

Playwright E2E: `tests/playwright/sanity/modules/v4-tests/`.

### Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Module::PACKAGES` | `string[]` | Atomic-widgets editor package names (`module.php`) |
| `add_filter( 'elementor/editor/v2/packages', … )` | — | Append packages to enqueue list |
| `$widgets_manager->register()` | — | Register atomic widget |
| `$elements_manager->register_element_type()` | — | Register atomic element |

## Extension

### New editor package

```php
const PACKAGES = [ 'editor-your-feature' ];
add_filter( 'elementor/editor/v2/packages', fn( $p ) => array_merge( $p, self::PACKAGES ) );
```

```typescript
// packages/packages/core/editor-your-feature/src/init.ts
export function init() { /* register locations, tools */ }
```

### New atomic element/widget

Extend `Atomic_Widget_Base` or `Atomic_Element_Base`. See [../atomic-widgets/authoring-widgets.md](../atomic-widgets/authoring-widgets.md).

## Internals

### Filter chain

```
Editor_Loader::get_packages_to_enqueue()
  → apply_filters( 'elementor/editor/packages', EXTENSIONS )
  → apply_filters( 'elementor/editor/v2/packages', … )  ← modules append
  → merged with LIBS
```

### Dynamic tags bridge

v3: `modules/dynamic-tags/`. v4 binding: `atomic-widgets/dynamic-tags/`. No dedicated editor package.

## See also

- [overview.md](overview.md)
- [data-flow.md](data-flow.md)
- [../editor-packages/overview.md](../editor-packages/overview.md)
- [../atomic-widgets/elements-catalog.md](../atomic-widgets/elements-catalog.md)
