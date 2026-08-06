# Example: Extend prop types

> Skill: [extend-prop-types](../../../.cursor/skills/extend-prop-types/SKILL.md)
> Docs: [fundamentals/prop-types.md](../fundamentals/prop-types.md), [fundamentals/transformers.md](../fundamentals/transformers.md)
> Verdict: **Relevant** — prop type is the primary surface; transformers are optional when render/import/export differs. Style prop types should also be covered via `internal-extend-css-converter` (Internal).

## Pattern: existing `size` type (core reference)

The built-in pair in `modules/atomic-widgets/prop-types/size-prop-type.php` and `props-resolver/transformers/styles/size-transformer.php` is the smallest end-to-end example.

### PHP transformer

Transformers receive the **inner** PropValue payload, not the full `{ $$type, value }` envelope.

```php
<?php

namespace MyPlugin\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

class My_Size_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		$size = $value['size'];
		$unit = $value['unit'];

		if ( 'custom' === $unit ) {
			return $size;
		}

		if ( 'auto' === $unit ) {
			return 'auto';
		}

		return +$size . $unit;
	}
}
```

### Register on styles context (priority 20+ overrides core at 10)

```php
add_action( 'elementor/atomic-widgets/styles/transformers/register', function ( $registry ) {
	$registry->register( 'size', new \MyPlugin\Transformers\My_Size_Transformer() );
}, 20 );
```

Hook receives `( Transformers_Registry $registry, Props_Resolver $resolver )`.

### TypeScript mirror (`@elementor/editor-props`)

```ts
import { createPropUtils } from '@elementor/editor-props';
import { z } from '@elementor/schema';

export const mySizePropTypeUtil = createPropUtils(
	'size',
	z.strictObject( {
		unit: z.enum( [ 'px', 'em', 'rem', '%', 'vh', 'vw', 'custom', 'auto' ] ),
		size: z.number(),
	} )
);
```

Registry key must match prop type `get_key()` / stored `$$type`.

## Contexts

| Context | Hook suffix |
|---------|-------------|
| Settings render | `settings/transformers/register` |
| Styles render | `styles/transformers/register` |
| Import | `import/transformers/register` |
| Export | `export/transformers/register` |
| Plain resolution | `plain/transformers/register` |

## MCP JSON Schema

Filter per-prop schema before LLM conversion:

```php
add_filter( 'elementor/atomic-widgets/llm-json-schema', function ( $schema, $prop_type ) {
	return $schema;
}, 10, 2 );
```

## Constraints

- Chained transform depth limit: 3.
- `disabled: true` on a PropValue resolves to `null`.
- `Union_Prop_Type` is composed via `Union_Prop_Type::make()->add_prop_type()`, not subclassed.
