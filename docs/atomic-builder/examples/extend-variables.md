# Example: Extend variables

> Skill: [extend-variables](../../../.cursor/skills/extend-variables/SKILL.md)
> Docs: [variables/types.md](../variables/types.md), [variables/api.md](../variables/api.md)
> Verdict: **Relevant** — kit tokens need PHP type + style schema + editor registration. Size has no PHP render transformer.

## PHP: register variable type

Register listeners before WordPress `init` (hook fires on `init`).

```php
add_action( 'elementor/variables/register', function (
	\Elementor\Modules\Variables\Classes\Variable_Types_Registry $registry
) {
	$registry->register(
		\My\Shadow_Variable_Prop_Type::get_key(),
		\My\Shadow_Variable_Prop_Type::make()
	);
} );
```

Built-in keys: `global-color-variable`, `global-font-variable`, `global-size-variable`, `global-custom-size-variable`.

## Style schema union

```php
add_filter( 'elementor/atomic-widgets/styles/schema', function ( array $schema ) {
	// Add your variable $$type to the union for relevant style keys.
	return $schema;
} );
```

Mirror `modules/variables/classes/style-schema.php` and `size-style-schema.php`.

## PHP styles transformer (when frontend must resolve id → var())

`Style_Transformers` registers `Global_Variable_Transformer` for **color and font only**.

```php
add_action( 'elementor/atomic-widgets/styles/transformers/register', function ( $registry ) {
	$registry->register( 'global-shadow-variable', new \My\Shadow_Variable_Transformer() );
} );
```

Size tokens have **no** matching PHP transformer. Editor canvas uses `StyleVariablesRenderer` (`:root { --label: value }`). Built-in size types in JS use `EmptyTransformer`, not the default `variableTransformer`.

## JS: `registerVariableType` in your editor v2 package `init()`

Do not edit core `register-variable-types.tsx`.

```ts
import { registerVariableType, variableTransformer } from '@elementor/editor-variables';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { BrushIcon } from '@elementor/icons';

import { shadowVariablePropTypeUtil } from './prop-types/shadow-variable-prop-type';

export function init() {
	registerVariableType( {
		key: shadowVariablePropTypeUtil.key,
		icon: BrushIcon,
		propTypeUtil: shadowVariablePropTypeUtil,
		fallbackPropTypeUtil: stringPropTypeUtil,
		variableType: 'shadow',
		defaultValue: '0 2px 4px rgba(0,0,0,0.1)',
		styleTransformer: variableTransformer,
	} );
}
```

Required fields: `key`, `icon`, `propTypeUtil`, `fallbackPropTypeUtil`, `variableType`. Full field + `valueField` prop contract: [variables/types.md](../variables/types.md#registervariabletype-field-contract).

**Without this JS step**, a PHP-only type works via REST / MCP / CSS but never appears in the "Add Variable" dropdown.

**No build pipeline (WP code snippet):** register through the `window.elementorV2.{camelCasePackage}` global for late-loaded scripts instead of an npm package — see [editor-packages/extending-editor.md](../editor-packages/extending-editor.md).

## REST / MCP

`elementor/v1/variables/*` and MCP `elementor/manage-global-variable` **verify** types already registered. They do not define new types.

## Prerequisites

Variables module loads when atomic widgets experiment (`e_atomic_elements`) is active.
