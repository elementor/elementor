import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import apiFetch from '@wordpress/api-fetch';

import { generatePrompt } from './prompt';
import { inputSchema, outputSchema } from './schema';

const CONVERSION_MARKER = '_convertedBy';
const CONVERSION_MARKER_VALUE = 'convert-css-to-atomic';

interface ConversionResult {
	props: Record< string, unknown >;
}

function addConversionMarker( result: {
	props?: Record< string, unknown >;
} ): ConversionResult {
	const props = result.props || {};
	const markedProps: Record< string, unknown > = {};

	for ( const [ key, value ] of Object.entries( props ) ) {
		if (
			value &&
			typeof value === 'object' &&
			value !== null &&
			'$$type' in value
		) {
			markedProps[ key ] = {
				...value,
				[ CONVERSION_MARKER ]: CONVERSION_MARKER_VALUE,
			};
		} else {
			markedProps[ key ] = value;
		}
	}

	return {
		props: markedProps,
	};
}

export const initConvertCssToAtomicTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'convert-css-to-atomic',
		description: generatePrompt(),
		schema: inputSchema,
		outputSchema,
		handler: async ( params ) => {
			const { cssString } = params;

			try {
				const result = ( await apiFetch( {
					path: '/elementor/v1/css-to-atomic',
					method: 'POST',
					data: {
						cssString,
					},
				} ) ) as ConversionResult;

				const markedResult = addConversionMarker( result );

				return markedResult;
			} catch ( error ) {
				throw error;
			}
		},
	} );
};
