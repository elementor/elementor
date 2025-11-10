import { getMCPByDomain } from '@elementor/editor-mcp';
import { type Props, type TransformablePropValue } from '@elementor/editor-props';
import { z } from '@elementor/schema';

import { handleCreateElement } from './handlers/create-element';
import { handleCreateStyle } from './handlers/create-style';
import { handleDeleteElement } from './handlers/delete-element';
import { handleDeleteStyle } from './handlers/delete-style';
import { handleDeselectAllElements, handleDeselectElement } from './handlers/deselect-element';
import { handleDuplicateElement } from './handlers/duplicate-element';
import { handleGetElementProps } from './handlers/get-element-props';
import { handleGetElementSchema } from './handlers/get-element-schema';
import { handleGetSelected } from './handlers/get-selected';
import { handleGetStyles } from './handlers/get-styles';
import { handleListAvailableTypes } from './handlers/list-available-types';
import { handleMoveElement } from './handlers/move-element';
import { handleSelectElement, handleSelectMultipleElements } from './handlers/select-element';
import { handleUpdateProps } from './handlers/update-props';
import { handleUpdateStyles } from './handlers/update-styles';

const actionEnum = z.enum( [
	'get-element-schema',
	'get-element-props',
	'create-element',
	'update-props',
	'create-style',
	'get-styles',
	'update-styles',
	'delete-style',
	'delete',
	'duplicate',
	'move',
	'select',
	'deselect',
	'deselect-all',
	'get-selected',
	'list-available-types',
] );

type Action = z.infer< typeof actionEnum >;

const schema = {
	action: actionEnum.describe( 'The element operation to perform.' ),
	elementId: z.string().optional().describe( 'The ID of the target element' ),
	elementIds: z.array( z.string() ).optional().describe( 'Array of element IDs for multi-element operations' ),
	elementType: z
		.string()
		.optional()
		.describe(
			'The type of element to create. Must be an atomic element type (required for create-element and get-element-schema actions)'
		),
	props: z
		.record( z.any() )
		.optional()
		.describe( "Props object for creating or updating an element. Must match the element type's propsSchema." ),
	containerId: z
		.string()
		.optional()
		.describe(
			'Parent container ID for element creation or move operations. Use "document" if parent is the document root.'
		),
	targetContainerId: z.string().optional().describe( 'Target container ID for move operations' ),
	styles: z
		.record( z.any() )
		.optional()
		.describe(
			"Styles object for creating or updating element styles. Must match the element type's stylesSchema."
		),
	styleId: z
		.string()
		.optional()
		.describe(
			'Style definition ID for style operations. If not provided, the first available style will be used (for update/delete).'
		),
	breakpoint: z
		.string()
		.optional()
		.describe( 'Breakpoint for style operations (e.g., "desktop", "tablet", "mobile"). Defaults to "desktop".' ),
	state: z
		.string()
		.optional()
		.describe( 'State for style operations (e.g., "hover", "active", or null). Defaults to null.' ),
	classesProp: z
		.string()
		.optional()
		.describe( 'Classes property name for create-style action. Defaults to "classes".' ),
	label: z.string().optional().describe( 'Label for create-style action. Defaults to "local".' ),
	custom_css: z
		.object( { raw: z.string() } )
		.optional()
		.describe( 'Custom CSS object with raw CSS string for create-style action.' ),
};

type ToolParams = {
	action: Action;
	elementId?: string;
	elementIds?: string[];
	elementType?: string;
	props?: Record< string, TransformablePropValue< string > >;
	containerId?: string;
	targetContainerId?: string;
	styles?: Props;
	styleId?: string;
	breakpoint?: string;
	state?: string | null;
	classesProp?: string;
	label?: string;
	custom_css?: { raw: string } | null;
};

function routeAction( params: ToolParams ) {
	try {
		switch ( params.action ) {
			case 'get-element-schema':
				if ( ! params.elementType ) {
					throw new Error( 'elementType is required for get-element-schema action' );
				}
				return handleGetElementSchema( params.elementType );

			case 'get-element-props':
				if ( ! params.elementId ) {
					throw new Error( 'elementId is required for get-element-props action' );
				}
				return handleGetElementProps( params.elementId );

			case 'create-element':
				if ( ! params.elementType ) {
					throw new Error( 'elementType is required for create-element action' );
				}
				if ( ! params.containerId ) {
					throw new Error( 'containerId is required for create-element action' );
				}
				return handleCreateElement( {
					elementType: params.elementType,
					containerId: params.containerId,
					props: params.props,
					styles: params.styles,
				} );

			case 'update-props':
				if ( ! params.elementId ) {
					throw new Error( 'elementId is required for update-props action' );
				}
				if ( ! params.props ) {
					throw new Error( 'props is required for update-props action' );
				}
				return handleUpdateProps( {
					elementId: params.elementId,
					props: params.props,
				} );

			case 'create-style':
				if ( ! params.elementId ) {
					throw new Error( 'elementId is required for create-style action' );
				}
				if ( ! params.styles ) {
					throw new Error( 'styles is required for create-style action' );
				}
				return handleCreateStyle( {
					elementId: params.elementId,
					styleId: params.styleId,
					classesProp: params.classesProp,
					label: params.label,
					styles: params.styles,
					breakpoint: params.breakpoint,
					state: params.state,
					customCss: params.custom_css,
				} );

			case 'get-styles':
				if ( ! params.elementId ) {
					throw new Error( 'elementId is required for get-styles action' );
				}
				return handleGetStyles( params.elementId );

			case 'update-styles':
				if ( ! params.elementId ) {
					throw new Error( 'elementId is required for update-styles action' );
				}
				if ( ! params.styles ) {
					throw new Error( 'styles is required for update-styles action' );
				}
				return handleUpdateStyles( {
					elementId: params.elementId,
					styleId: params.styleId,
					styles: params.styles,
					breakpoint: params.breakpoint,
					state: params.state,
				} );

			case 'delete-style':
				if ( ! params.elementId ) {
					throw new Error( 'elementId is required for delete-style action' );
				}
				return handleDeleteStyle( {
					elementId: params.elementId,
					styleId: params.styleId,
				} );

			case 'delete':
				if ( ! params.elementId ) {
					throw new Error( 'elementId is required for delete action' );
				}
				return handleDeleteElement( params.elementId );

			case 'duplicate':
				if ( ! params.elementId ) {
					throw new Error( 'elementId is required for duplicate action' );
				}
				return handleDuplicateElement( params.elementId );

			case 'move':
				if ( ! params.elementId ) {
					throw new Error( 'elementId is required for move action' );
				}
				if ( ! params.targetContainerId ) {
					throw new Error( 'targetContainerId is required for move action' );
				}
				return handleMoveElement( {
					elementId: params.elementId,
					targetContainerId: params.targetContainerId,
				} );

			case 'select':
				if ( params.elementIds && params.elementIds.length > 0 ) {
					return handleSelectMultipleElements( params.elementIds );
				}
				if ( ! params.elementId ) {
					throw new Error( 'elementId or elementIds is required for select action' );
				}
				return handleSelectElement( params.elementId );

			case 'deselect':
				if ( ! params.elementId ) {
					throw new Error( 'elementId is required for deselect action' );
				}
				return handleDeselectElement( params.elementId );

			case 'deselect-all':
				return handleDeselectAllElements();

			case 'get-selected':
				return handleGetSelected();

			case 'list-available-types':
				return handleListAvailableTypes();

			default:
				throw new Error( `Unknown action: ${ params.action }` );
		}
	} catch ( error ) {
		const errorMessage = error instanceof Error ? error.message : String( error );
		throw new Error( `Failed to execute action "${ params.action }": ${ errorMessage }` );
	}
}

export function initElementsTool() {
	getMCPByDomain( 'elements' ).addTool( {
		name: 'elements',
		schema,
		description: `This tool manages individual Elementor atomic elements (v4).

**When to use this tool:**

Use this tool to create, update, delete, duplicate, move, and select individual atomic elements, as well as retrieve their schemas and current props.

**Available actions:**

- \`list-available-types\`: List all available atomic element types.
- \`get-element-schema\`: Get the propsSchema and controls for an element type. Required before creating elements of a new type.
- \`get-element-props\`: Get the current prop values for an existing element.
- \`create-element\`: Create a new atomic element with specified props and styles (Important to match props and styles by the schema, use get-element-schema to get the schema first).
- \`update-props\`: Update props for an existing element.
- \`create-style\`: Create a new style definition for an element.
- \`get-styles\`: Get all style definitions for an element.
- \`update-styles\`: Update styles for an existing element's style variant.
- \`delete-style\`: Delete a style definition from an element.
- \`delete\`: Delete an element.
- \`duplicate\`: Duplicate an existing element.
- \`move\`: Move an element to a different container.
- \`select\`: Select one or more elements.
- \`deselect\`: Deselect a specific element.
- \`deselect-all\`: Deselect all selected elements.
- \`get-selected\`: Get currently selected elements.

**Constraints:**

- Before creating an element of a certain type for the first time, you MUST call \`get-element-schema\` to retrieve its schema.
- You can only update props for existing elements.
- All props must match the element type's propsSchema keys.
- Element types must be atomic (have atomic_controls and atomic_props_schema).
- Container IDs must exist and be valid before create/move operations.

** Must do with every operation **
As of the user can ask in multiple ways the creation of the element, you need to first get the list of available types with "list-available-types" action.
After getting it, convert to the most relevant type that the user requested and if this is not clear, request for user input.
After finding out the proper type, get the schema for it with "get-element-schema" action.

** Styles and Settings propUtils **
Getting the schema is important as it introduces the propUtils for the styles and settings.
You can use the propUtils to create, update, delete, and get the values of the styles and settings.
Settings exists in the result of the get-element-schema action -> propsSchema.
Styles exists in the result of the get-element-schema action -> stylesSchema.

**Examples:**

Get schema for heading element:
\`\`\`json
{ "action": "get-element-schema", "elementType": "e-heading" }
\`\`\`

Create a heading element:
\`\`\`json
{ "action": "create-element", "elementType": "e-heading", "containerId": "document", "props": { "title": { $$type: "string", "value": "Hello World" } } }
\`\`\`

Update element props:
\`\`\`json
{ "action": "update-props", "elementId": "abc123", "props": { "title": "Updated Title" } }
\`\`\`

Create element style:
\`\`\`json
{ "action": "create-style", "elementId": "abc123", "styles": { "padding": "20px", "margin": "10px" } }
\`\`\`

Get element styles:
\`\`\`json
{ "action": "get-styles", "elementId": "abc123" }
\`\`\`

Update element styles:
\`\`\`json
{ "action": "update-styles", "elementId": "abc123", "styles": { "padding": "20px", "margin": "10px" } }
\`\`\`

Delete element style:
\`\`\`json
{ "action": "delete-style", "elementId": "abc123", "styleId": "style-id-123" }
\`\`\``,
		handler: async ( params: ToolParams ) => {
			return routeAction( params ) as unknown as string;
		},
	} );
}
