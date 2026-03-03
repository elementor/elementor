import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import apiFetch from '@wordpress/api-fetch';

import { generatePrompt } from './prompt';
import { inputSchema, outputSchema } from './schema';

interface ConversionResult {
	props: Record< string, unknown >;
	customCss?: string;
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

				return result;
			} catch ( error ) {
				throw error;
			}
		},
	} );
};
