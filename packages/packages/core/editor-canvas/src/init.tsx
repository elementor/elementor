import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { getMCPByDomain } from '@elementor/editor-mcp';

import { ClassesRename } from './components/classes-rename';
import { ElementsOverlays } from './components/elements-overlays';
import { StyleRenderer } from './components/style-renderer';
import { initSettingsTransformers } from './init-settings-transformers';
import { initStyleTransformers } from './init-style-transformers';
import { initLegacyViews } from './legacy/init-legacy-views';
import { initCanvasMcp } from './mcp/canvas-mcp';
import { initLinkInLinkPrevention } from './prevent-link-in-link-commands';
import { initStyleCommands } from './style-commands/init-style-commands';

export function init() {
	initStyleTransformers();
	initStyleCommands();

	initLinkInLinkPrevention();

	initLegacyViews();

	initSettingsTransformers();

	injectIntoTop( {
		id: 'elements-overlays',
		component: ElementsOverlays,
	} );

	injectIntoTop( {
		id: 'canvas-style-render',
		component: StyleRenderer,
	} );

	injectIntoLogic( {
		id: 'classes-rename',
		component: ClassesRename,
	} );

	initCanvasMcp(
		getMCPByDomain( 'canvas', {
			instructions: `Canvas MCP - Working with widgets and styles: how to use the PropType schemas and generate PropValue structures

# PropType schema and PropValue structure
A PropType defines the type of a property, including its structure and constraints, while a PropValue represents the actual value assigned to that property based on its PropType.

Every widget property has a PropType schema, including styles under the "_styles" property.
A PropType schema looks like the following:
\`\`\`json
{
  kind: 'string' | 'number' | 'plain' | 'array' | 'object' | 'union' | 'custom', // The kind of the prop type. "plain" is an alias for "string" in this context.
	key: string, // The parser type to run when a PropValue is received. the "key" must be used as "$$type" in the PropValue and is MANDATORY.
}\`\`\`

For *union* kinds, the schema includes "prop_types" property defining the possible types and DOES NOT include "key", the key to be used is declared in each option inside "prop_types".
\`\`\`json
{
  kind: 'union',
	key: never, // No key property for union kinds. The key is defined in each option inside "prop_types".
	prop_types: Record<string, PropType>, // The possible prop types for the union. The keys are used for debugging, no need to remember the record's identifiers. Use the "key" property from each PropType used inside the record.
}
\`\`\`

For *object* kinds, the schema includes "shape" property defining the child properties inside the object.
\`\`\`json
{
	kind: 'object',
	key: string, // The parser type to run when a PropValue is received. the "key" must be used as "$$type" in the PropValue and is MANDATORY.
	shape: Record<string, PropType | UnionPropType>, // The child properties inside the object.
}
\`\`\`

For *array* kinds, the schema includes "item_prop_type" property defining the type of each item in the array.
\`\`\`json
{
  kind: 'array',
	key: string, // The parser type to run when a PropValue is received. the "key" must be used as "$$type" in the PropValue and is MANDATORY.
	item_prop_type: PropType | UnionPropType, // The prop type schema for each item in the array.
}
\`\`\`

Arrays are NOT typed arrays, which means that an array can be a mixture of different types, as long as each item follows the "item_prop_type" schema.
An example for such usage is the _styles schema "background", which is an "object" kind. It has in it's shape a property "background-overlay" kind of a mixed array of different types. It could work with multiple overlay types, such as color, gradient, image, etc.

The PropValue structure to be used when configuring properties is as follows:
\`\`\`json
{
		"$$type": string, // MANDATORY as defined in the PropType schema under the "key" property
		value: unknown // The value according to the PropType schema for kinds of "array", use array with PropValues items inside. For "object", read the shape property of the PropType schema. For "plain", use strings.
}
\`\`\`
`,
		} )
	);
}
