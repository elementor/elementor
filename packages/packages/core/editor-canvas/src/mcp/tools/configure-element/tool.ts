import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';
import { doUpdateElementProperty } from '../../utils/do-update-element-property';
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
			if ( ! propertiesToChange ) {
				throw new Error(
					'propertiesToChange is required to configure an element. Now that you have this information, ensure you have the schema and try again.'
				);
			}
			const toUpdate = Object.entries( propertiesToChange );
			for ( const [ propertyName, propertyValue ] of toUpdate ) {
				if ( ! propertyName && ! elementId && ! elementType ) {
					throw new Error(
						'propertyName, elementId, elementType are required to configure an element. If you want to retreive the schema, use the get-element-configuration-schema tool.'
					);
				}

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
