import { McpAppDisplayMode, type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';

import { SUGGESTED_ACTIONS_URI } from '../../resources/suggested-actions-resource';
import { getMcpErrorMessage } from '../../utils/get-mcp-error-message';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
const MIN_SUGGESTED_ACTIONS = 1;
const MAX_SUGGESTED_ACTIONS = 5;

const suggestedActionSchema = z.object( {
	label: z.string().describe( 'Chip label shown to the user' ),
	prompt: z.string().describe( 'User message sent to the agent when the chip is clicked' ),
	icon: z.enum( [ 'sparkles', 'grid', 'branch' ] ).optional(),
} );

type ShowSuggestedActionsResponse = {
	actions: z.infer< typeof suggestedActionSchema >[];
};

export const initShowSuggestedActionsTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'show-suggested-actions',
		description:
			'Renders interactive suggested next-step action chips in the chat UI (MCP Apps). Call after completing a meaningful editor step to offer follow-up prompts the user can click.',
		schema: {
			actions: z
				.array( suggestedActionSchema )
				.min( MIN_SUGGESTED_ACTIONS )
				.max( MAX_SUGGESTED_ACTIONS )
				.describe( '1-5 suggested actions' ),
		},
		outputSchema: {
			actions: z.array( suggestedActionSchema ),
		},
		ui: {
			resourceUri: SUGGESTED_ACTIONS_URI,
			displayMode: McpAppDisplayMode.Inline,
		},
		handler: async ( { actions } ) => {
			try {
				const { data } = await httpService().post< HttpResponse< ShowSuggestedActionsResponse > >(
					MCP_PROXY_URL,
					{
						tool: 'show-suggested-actions',
						input: { actions },
					}
				);

				return { actions: data.data.actions };
			} catch ( error ) {
				throw new Error( getMcpErrorMessage( error, 'show-suggested-actions' ) );
			}
		},
	} );
};
