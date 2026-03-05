import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { STYLE_SCHEMA_URI, WIDGET_SCHEMA_URI } from '../../resources/widgets-schema-resource';
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
		requiredResources: [
			{ description: 'Widgets schema', uri: WIDGET_SCHEMA_URI },
			{ description: 'Styles schema', uri: STYLE_SCHEMA_URI },
		],
		modelPreferences: {
			hints: [ { name: 'claude-sonnet-4-5' } ],
			intelligencePriority: 0.8,
			speedPriority: 0.7,
		},
		handler: ( { elementId, propertiesToChange, elementType, stylePropertiesToChange } ) => {
			const toUpdate = Object.entries( propertiesToChange );
			const { valid, errors } = validateInput.validatePropSchema( elementType, propertiesToChange );
			const { valid: stylesValid, errors: stylesErrors } = validateInput.validateStyles(
				stylePropertiesToChange || {}
			);
			if ( ! valid ) {
				const errorMessage = `Failed to configure element "${ elementId }" due to invalid properties: ${ errors?.join(
					'\n- '
				) }`;
				throw new Error( errorMessage );
			}
			if ( ! stylesValid ) {
				const errorMessage = `Failed to configure element "${ elementId }" due to invalid style properties: ${ stylesErrors?.join(
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
						propertyType: 'prop',
					} );
					throw new Error( errorMessage );
				}
			}
			for ( const [ stylePropertyName, stylePropertyValue ] of Object.entries( stylePropertiesToChange || {} ) ) {
				try {
					doUpdateElementProperty( {
						elementId,
						elementType,
						propertyName: '_styles',
						propertyValue: {
							[ stylePropertyName ]: stylePropertyValue,
						},
					} );
				} catch ( error ) {
					const errorMessage = createUpdateErrorMessage( {
						propertyName: `(style) ${ stylePropertyName }`,
						elementId,
						elementType,
						propertyType: 'style',
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
	propertyType: 'prop' | 'style';
} ) {
	const { propertyName, elementId, elementType, error, propertyType } = opts;
	return `Failed to update property "${ propertyName }" on element "${ elementId }": ${ error.message }.
${
	propertyType === 'prop'
		? `
Check the element's PropType schema at the resource [${ WIDGET_SCHEMA_URI.replace(
				'{widgetType}',
				elementType
		  ) }] for type "${ elementType }" to ensure the property exists and the value matches the expected PropType.
Now that you have this information, ensure you have the schema and try again.`
		: `
Check the styles schema at the resource [${ STYLE_SCHEMA_URI.replace(
				'{category}',
				propertyName
		  ) }] at editor-canvas__elementor://styles/schema/{category} to ensure the style property exists and the value matches the expected PropType.
`
};
}`;
}
