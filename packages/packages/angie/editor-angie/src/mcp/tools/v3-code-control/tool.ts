import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { handleCodeControlTool } from './handler';

export const initV3CodeControlTool = ( reg: MCPRegistryEntry ): void => {
	const { addTool } = reg;

	addTool( {
		name: 'v3-code-control',
		description:
			'Read or set the value of one V3 code control on one non-atomic element. Rejects atomic elements and non-code controls.',
		schema: {
			action: z
				.enum( [ 'get', 'set' ] )
				.describe( 'get returns the current value; set writes a new value (one undo step).' ),
			elementId: z.string().describe( 'Element ID that owns the control.' ),
			controlName: z.string().describe( 'Control name to read or write.' ),
			value: z.string().optional().describe( 'New code value. Required for set.' ),
		},
		outputSchema: {
			success: z.boolean().optional(),
			elementId: z.string(),
			controlName: z.string(),
			controlType: z.string(),
			language: z.string(),
			value: z.string(),
		},
		isDestructive: true,
		handler: handleCodeControlTool,
	} );
};
