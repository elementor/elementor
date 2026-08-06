import { McpAppDisplayMode, type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { SUGGESTED_ACTIONS_URI } from '../../resources/suggested-actions-resource';

export const initShowSuggestedActionsTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'show-suggested-actions',
		description:
			'Renders interactive suggested next-step action chips in the chat UI (MCP Apps). Call after completing a meaningful editor step to offer follow-up prompts the user can click.',
		schema: {
			actions: z
				.array(
					z.object( {
						label: z.string().describe( 'Chip label shown to the user' ),
						prompt: z.string().describe( 'User message sent to the agent when the chip is clicked' ),
						icon: z.enum( [ 'sparkles', 'grid', 'branch' ] ).optional(),
					} )
				)
				.min( 1 )
				.max( 5 )
				.describe( '1-5 suggested actions' ),
		},
		outputSchema: {
			actions: z.array( z.any() ),
		},
		ui: {
			resourceUri: SUGGESTED_ACTIONS_URI,
			displayMode: McpAppDisplayMode.Inline,
		},
		handler: async ( { actions } ) => ( { actions } ),
	} );
};
