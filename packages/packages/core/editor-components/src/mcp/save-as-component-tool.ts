import { getContainer, type V1ElementData } from '@elementor/editor-elements';
import { getMCPByDomain } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { createUnpublishedComponent } from '../store/create-unpublished-component';

const InputSchema = {
	element_id: z
		.string()
		.describe(
			'The unique identifier of the element to save as a component. ' +
				'Use the "list-elements" tool to find available element IDs in the current document.'
		),
	component_name: z
		.string()
		.describe( 'The name for the new component. Should be descriptive and unique among existing components.' ),
};

const OutputSchema = {
	status: z.enum( [ 'ok', 'error' ] ).describe( 'The status of the operation' ),
	message: z.string().optional().describe( 'Additional information about the operation result' ),
	component_uid: z
		.string()
		.optional()
		.describe( 'The unique identifier of the newly created component (only present on success)' ),
};

export const VALID_ELEMENT_TYPES = [ 'e-div-block', 'e-flexbox', 'e-tabs' ];
export const ERROR_MESSAGES = {
	ELEMENT_NOT_FOUND: "Element not found. Use 'list-elements' to get valid element IDs.",
	ELEMENT_NOT_ONE_OF_TYPES: `Element is not one of the following types: ${ VALID_ELEMENT_TYPES.join( ', ' ) }`,
	ELEMENT_IS_LOCKED: 'Cannot save a locked element as a component.',
};

export const handleSaveAsComponent = async ( params: { element_id: string; component_name: string } ) => {
	const { element_id: elementId, component_name: componentName } = params;

	try {
		const container = getContainer( elementId );

		if ( ! container ) {
			return {
				status: 'error' as const,
				message: ERROR_MESSAGES.ELEMENT_NOT_FOUND,
			};
		}
		const elType = container.model.get( 'elType' );

		if ( ! VALID_ELEMENT_TYPES.includes( elType ) ) {
			return {
				status: 'error' as const,
				message: ERROR_MESSAGES.ELEMENT_NOT_ONE_OF_TYPES,
			};
		}

		const element = container.model.toJSON( { remove: [ 'default' ] } ) as V1ElementData;

		if ( element?.isLocked ) {
			return {
				status: 'error' as const,
				message: ERROR_MESSAGES.ELEMENT_IS_LOCKED,
			};
		}

		const uid = createUnpublishedComponent( componentName, element, null );

		return {
			status: 'ok' as const,
			message: `Component "${ componentName }" created successfully.`,
			component_uid: uid,
		};
	} catch ( error ) {
		const message: string = ( error as Error ).message || 'Unknown error occurred';
		return {
			status: 'error' as const,
			message: `Failed to save element as component: ${ message }`,
		};
	}
};

export const initSaveAsComponentTool = () => {
	return getMCPByDomain( 'components' ).addTool( {
		name: 'save-as-component',
		schema: InputSchema,
		outputSchema: OutputSchema,
		description: `Save an existing element as a reusable component in the Elementor editor.

## When to use this tool:
- When the user wants to create a reusable component from an existing element.
- When the user wants to convert a widget, container, or section into a component.
- When the user asks to "save as component", "create component from", or "make this a component".

## When NOT to use this tool:
- Do not use for elements that are already components (widgetType: 'e-component').
- Do not use for locked elements.
- Do not guess element IDs. Always use "list-elements" first to get valid IDs.

## Prerequisites:
1. **Get element ID first**: Use the "list-elements" tool to find the element you want to convert.
2. **Verify element type**: Ensure the element is not already a component (widgetType should not be 'e-component').
3. **Check if element is unlocked**: Locked elements cannot be saved as components.
4. **Check that the element is one of the following types**: ${ VALID_ELEMENT_TYPES.join( ', ' ) }

## Required parameters:
- **element_id**: The unique ID of the element to save. Get this from "list-elements" tool.
- **component_name**: A descriptive name for the component (2-50 characters).

## Tool chaining:
1. Call \`list-elements\` -> Find the target element and note its \`id\`.
2. Call \`save-as-component(element_id=<id>, component_name="My Component")\`.

## Example tool call:
\`\`\`json
{ "element_id": "abc123", "component_name": "Hero Section" }
\`\`\`

## Example success response:
\`\`\`json
{ "status": "ok", "message": "Component created successfully", "component_uid": "component_xyz789" }
\`\`\`

## Example error responses:

${ Object.entries( ERROR_MESSAGES )
	.map( ( [ message ] ) => `\`\`\`json\n{ "status": "error", "message": "${ message }" }\`\`\`` )
	.join( '\n' ) }
	
## Error handling:

- If element not found: Use \`list-elements\` to get valid IDs.
- If element is locked: Inform the user the element cannot be modified.
- If element is not one of the valid element types: Inform the user that it should be one of the following types: ${ VALID_ELEMENT_TYPES.join(
			', '
		) }
`,
		handler: async ( params ) => await handleSaveAsComponent( params ),
	} );
};
