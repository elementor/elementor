import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { getConsoleErrors } from '../../console-errors-monitor';
import { readConsoleErrorsToolPrompt } from './prompt';

const DEFAULT_LIMIT = 10;

export const initReadConsoleErrorsTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'read-console-errors',
		description: readConsoleErrorsToolPrompt.prompt(),
		schema: {
			since: z.number().optional().describe( 'Unix timestamp (ms). Only return errors logged after this time.' ),
			limit: z
				.number()
				.optional()
				.default( DEFAULT_LIMIT )
				.describe( `Max errors to return (default ${ DEFAULT_LIMIT })` ),
		},
		outputSchema: {
			success: z.boolean(),
			found: z.number().describe( 'Number of errors returned' ),
			message: z.string(),
			errors: z.array(
				z.object( {
					timestamp: z.number(),
					level: z.literal( 'error' ),
					message: z.string(),
					stack: z.string().optional(),
				} )
			),
		},
		handler: ( { since, limit } ) => {
			const errors = getConsoleErrors( { since, limit } );
			const found = errors.length;

			return {
				success: true,
				found,
				message: found > 0 ? `Found ${ found } error(s). Review the issues below.` : 'No console errors found.',
				errors,
			};
		},
	} );
};
