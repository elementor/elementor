import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import {
	type PropValue,
	type TransformablePropValue,
} from '@elementor/editor-props';

import {
	STYLE_SCHEMA_URI,
	WIDGET_SCHEMA_URI,
} from '../../resources/widgets-schema-resource';
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
		requiredResources: [
			{ description: 'Widgets schema', uri: WIDGET_SCHEMA_URI },
			{ description: 'Styles schema', uri: STYLE_SCHEMA_URI },
		],
		handler: ( {
			elementId,
			propertiesToChange,
			elementType,
			stylePropertiesToChange,
		} ) => {
			if ( ! propertiesToChange && ! stylePropertiesToChange ) {
				throw new Error(
					'propertiesToChange or stylePropertiesToChange is required to configure an element. Now that you have this information, ensure you have the schema and try again.'
				);
			}

			validateColorPropertyIfPresent( stylePropertiesToChange );

			if ( propertiesToChange ) {
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
							propertyValue: propertyValue as
								| string
								| PropValue
								| TransformablePropValue< string, unknown >,
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
			}

			if ( stylePropertiesToChange ) {
				for ( const [
					stylePropertyName,
					stylePropertyValue,
				] of Object.entries( stylePropertiesToChange ) ) {
					try {
						doUpdateElementProperty( {
							elementId,
							elementType,
							propertyName: '_styles',
							propertyValue: {
								[ stylePropertyName ]: stylePropertyValue,
							} as Record< string, PropValue >,
						} );
					} catch ( error ) {
						const errorMessage = createUpdateErrorMessage( {
							propertyName: `(style) ${ stylePropertyName }`,
							elementId,
							elementType,
							error: error as Error,
						} );
						throw new Error( errorMessage );
					}
				}
			}

			return {
				success: true,
			};
		},
	} );
};

function validateColorPropertyIfPresent(
	stylePropertiesToChange?: Record< string, unknown >
) {
	if ( stylePropertiesToChange && 'color' in stylePropertiesToChange ) {
		validateColorPropertyRequiresConversion(
			stylePropertiesToChange.color
		);
	}
}

function validateColorPropertyRequiresConversion( colorValue: unknown ) {
	const isPropValue =
		typeof colorValue === 'object' &&
		colorValue !== null &&
		'$$type' in colorValue;
	const isRawString = typeof colorValue === 'string';
	const hasConversionMarker = isPropValue && '_convertedBy' in colorValue;
	const conversionMarkerValue = hasConversionMarker
		? ( colorValue as { _convertedBy?: string } )._convertedBy
		: null;

	throwErrorIfColorValueIsRawString( isRawString, isPropValue, colorValue );
	throwErrorIfColorPropValueHasWrongType( isPropValue, colorValue );
	throwErrorIfColorPropValueMissingConversionMarker(
		isPropValue,
		hasConversionMarker,
		colorValue
	);
	throwErrorIfColorPropValueHasInvalidConversionMarker(
		hasConversionMarker,
		conversionMarkerValue ?? null
	);
}

function throwErrorIfColorValueIsRawString(
	isRawString: boolean,
	isPropValue: boolean,
	colorValue: unknown
) {
	if ( isRawString || ( ! isPropValue && colorValue !== null ) ) {
		const errorMessage = `Invalid color property format. You MUST call "convert-css-to-atomic" tool FIRST to convert CSS color strings (e.g., "red", "#ff0000") into PropValue format before using this tool. Raw color strings are not accepted. Received: ${ JSON.stringify(
			colorValue
		) }`;
		throw new Error( errorMessage );
	}
}

function throwErrorIfColorPropValueHasWrongType(
	isPropValue: boolean,
	colorValue: unknown
) {
	if (
		isPropValue &&
		( colorValue as { $$type: string } ).$$type !== 'color'
	) {
		const errorMessage = `Invalid color PropValue type. Expected $$type: "color", but got $$type: "${
			( colorValue as { $$type: string } ).$$type
		}". You MUST use the "convert-css-to-atomic" tool to get the correct PropValue format.`;
		throw new Error( errorMessage );
	}
}

function throwErrorIfColorPropValueMissingConversionMarker(
	isPropValue: boolean,
	hasConversionMarker: boolean,
	colorValue: unknown
) {
	if ( isPropValue && ! hasConversionMarker ) {
		const colorHex =
			( colorValue as { value?: string } ).value || 'unknown';
		const errorMessage = `ERROR: Color property missing conversion marker. You MUST call "convert-css-to-atomic" tool FIRST.

**WHAT YOU DID WRONG:**
You manually constructed a PropValue: ${ JSON.stringify( colorValue ) }
This is NOT allowed. You cannot create PropValues manually, even if you know the format.

**WHAT YOU MUST DO (STEP-BY-STEP):**
1. Call tool: "convert-css-to-atomic"
2. Pass: { "cssString": "color: ${ colorHex };", }
3. Extract: result.props.color (this will have the _convertedBy marker)
4. Use that EXACT object in stylePropertiesToChange.color

**EXAMPLE WORKFLOW:**
Step 1: convert-css-to-atomic({ cssString: "color: ${ colorHex };" })
Step 2: Get result.props.color (contains _convertedBy marker)
Step 3: configure-element({ ..., stylePropertiesToChange: { color: result.props.color } })

**WHY THIS IS REQUIRED:**
The converter tool adds a special "_convertedBy" marker that proves the PropValue was created correctly. Without this marker, the tool will REJECT your request. This is enforced by validation - you cannot bypass it.`;
		throw new Error( errorMessage );
	}
}

function throwErrorIfColorPropValueHasInvalidConversionMarker(
	hasConversionMarker: boolean,
	conversionMarkerValue: string | null
) {
	if (
		hasConversionMarker &&
		conversionMarkerValue !== 'convert-css-to-atomic'
	) {
		const errorMessage = `Invalid conversion marker. Expected "_convertedBy": "convert-css-to-atomic", but got "${ conversionMarkerValue }". You MUST use the "convert-css-to-atomic" tool to convert color properties.`;
		throw new Error( errorMessage );
	}
}

function createUpdateErrorMessage( opts: {
	propertyName: string;
	elementId: string;
	elementType: string;
	error: Error;
} ) {
	const { propertyName, elementId, elementType, error } = opts;
	return `Failed to update property "${ propertyName }" on element "${ elementId }": ${
		error.message
	}.
Check the element's PropType schema at the resource [${ WIDGET_SCHEMA_URI.replace(
		'{widgetType}',
		elementType
	) }] for type "${ elementType }" to ensure the property exists and the value matches the expected PropType.
Now that you have this information, ensure you have the schema and try again.`;
}
