import { getContainer, type V1ElementData } from '@elementor/editor-elements';
import { getMCPByDomain } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { createUnpublishedComponent } from '../store/actions/create-unpublished-component';

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

export const handleSaveAsComponent = async ( params: z.infer< z.ZodObject< typeof InputSchema > > ) => {
	const { element_id: elementId, component_name: componentName } = params;

	const container = getContainer( elementId );

	if ( ! container ) {
		throw new Error( ERROR_MESSAGES.ELEMENT_NOT_FOUND );
	}

	const elType = container.model.get( 'elType' );

	if ( ! VALID_ELEMENT_TYPES.includes( elType ) ) {
		throw new Error( ERROR_MESSAGES.ELEMENT_NOT_ONE_OF_TYPES );
	}

	const element = container.model.toJSON( { remove: [ 'default' ] } ) as V1ElementData;

	if ( element?.isLocked ) {
		throw new Error( ERROR_MESSAGES.ELEMENT_IS_LOCKED );
	}

	const uid = createUnpublishedComponent( componentName, element, null );

	return {
		status: 'ok' as const,
		message: `Component "${ componentName }" created successfully.`,
		component_uid: uid,
	};
};

export const initSaveAsComponentTool = () => {
	return getMCPByDomain( 'components' ).addTool( {
		name: 'save-as-component',
		schema: InputSchema,
		outputSchema: OutputSchema,
		description: `Save an existing element as a reusable component in the Elementor editor.

## When NOT to use this tool:
- Do not use for elements that are already components (widgetType: 'e-component').
- Do not use for locked elements.
- Do not guess element IDs. Always use "list-elements" first to get valid IDs.

## Prerequisites:
- **Verify element type**: Ensure the element is not already a component (widgetType should not be 'e-component').
- **Check if element is unlocked**: Locked elements cannot be saved as components.
- **Check that the element is one of the following types**: ${ VALID_ELEMENT_TYPES.join( ', ' ) }

## Required parameters:
- **element_id**: The unique ID of the element to save.
- **component_name**: A descriptive name for the component (2-50 characters).

## Example tool call:
\`\`\`json
{ "element_id": "abc123", "component_name": "Hero Section" }
\`\`\`
`,
		handler: handleSaveAsComponent,
	} );
};
