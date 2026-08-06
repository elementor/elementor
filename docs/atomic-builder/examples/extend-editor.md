# Example: Extend editor

> Skill: [extend-editor](../../../.cursor/skills/extend-editor/SKILL.md)
> Docs: [editor-packages/extending-editor.md](../editor-packages/extending-editor.md)
> Verdict: **Relevant** — primary path for editor UI and in-editor MCP. Not PHP `modules/mcp/` abilities.

## PHP: register package

```php
add_filter( 'elementor/editor/v2/packages', function ( array $packages ) {
	return array_merge( $packages, [ 'editor-my-feature' ] );
} );

add_filter( 'elementor/editor/v2/scripts/env', function ( array $env ) {
	$env['@elementor/editor-my-feature'] = [ 'enabled' => true ];
	return $env;
} );
```

Reference: `modules/site-navigation/module.php`, `packages/packages/core/editor-site-navigation/`.

## JS: `src/init.ts` + re-export from `src/index.ts`

Build footer auto-calls `window.elementorV2.{camelCasePackage}?.init?.()` (`editor-my-feature` → `editorMyFeature`).

```ts
import { injectIntoPageIndication, toolsMenu } from '@elementor/editor-app-bar';
import { getMCPByDomain } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { MyIndicator } from './components/my-indicator';
import { useMyToggleProps } from './hooks/use-my-toggle-props';

export function init() {
	injectIntoPageIndication( {
		id: 'my-indicator',
		component: MyIndicator,
	} );

	toolsMenu.registerToggleAction( {
		id: 'toggle-my-panel',
		priority: 20,
		useProps: useMyToggleProps,
	} );

	const mcp = getMCPByDomain( 'my_feature', {
		instructions: 'Short hint for agents',
		docs: 'Full domain documentation',
	} );

	mcp.addTool( {
		name: 'my_tool',
		description: 'Does something in the editor',
		schema: {
			elementId: z.string().describe( 'Target element id' ),
		},
		handler: async ( { elementId } ) => `Handled ${ elementId }`,
	} );
}
```

```ts
// src/index.ts
export { init } from './init';
```

## Injection APIs (common)

| Area | API | Package |
|------|-----|---------|
| Shell | `injectIntoTop`, `injectIntoLogic` | `@elementor/editor` |
| App bar | `injectIntoPageIndication`, `toolsMenu.registerToggleAction` | `@elementor/editor-app-bar` |
| Style tab | `injectIntoStyleTab` | `@elementor/editor-editing-panel` |
| Elements panel | `injectTab` | `@elementor/editor-elements-panel` |
| Styles repo | `stylesRepository.register` | `@elementor/editor-styles-repository` |
| v1 bridge | `registerDataHook`, `blockCommand`, `__privateListenTo` | `@elementor/editor-v1-adapters` |

## MCP namespace

Must match `/^[a-z_]+$/` (lowercase + underscores). Schema values are Zod objects from `@elementor/schema`, not plain JSON Schema.

## Verify

- Package appears in editor network bundle.
- UI renders in chosen slot.
- MCP tools visible when Angie / WebMCP experiment is enabled.
