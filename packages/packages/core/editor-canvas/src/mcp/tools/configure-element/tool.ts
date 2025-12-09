import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';
import { doUpdateElementProperty } from '../../utils/do-update-element-property';
import { validateInput } from '../../utils/validate-input';
import { configureElementToolPrompt } from './prompt';
import { inputSchema as schema, outputSchema } from './schema';

export const initConfigureElementTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'configure-element',
		description: configureElementToolPrompt,
		schema,
		outputSchema,
		handler: ( { elementId, propertiesToChange, elementType } ) => {
			const toUpdate = Object.entries( propertiesToChange );
			const { valid, errors } = validateInput.validatePropSchema( elementType, propertiesToChange, [
				'_styles',
			] );
			if ( ! valid ) {
				const errorMessage = `Failed to configure element "${ elementId }" due to invalid properties: ${ errors?.join(
					'\n- '
				) }`;
				throw new Error( errorMessage );
			}
			for ( const [ propertyName, propertyValue ] of toUpdate ) {
				try {
					doUpdateElementProperty( {
						elementId,
						elementType,
						propertyName,
						propertyValue,
					} );
				} catch ( error ) {
					const errorMessage = createUpdateErrorMessage( {
						propertyName,
						elementId,
						elementType,
						error: error as Error,
					} );
					throw new Error( errorMessage );
				}
			}
			return {
				success: true,
			};
		},
	} );
};

function createUpdateErrorMessage( opts: {
	propertyName: string;
	elementId: string;
	elementType: string;
	error: Error;
} ) {
	const { propertyName, elementId, elementType, error } = opts;
	return `Failed to update property "${ propertyName }" on element "${ elementId }": ${ error.message }.
Check the element's PropType schema at the resource [${ WIDGET_SCHEMA_URI.replace(
		'{widgetType}',
		elementType
	) }] for type "${ elementType }" to ensure the property exists and the value matches the expected PropType.
Now that you have this information, ensure you have the schema and try again.`;
}
