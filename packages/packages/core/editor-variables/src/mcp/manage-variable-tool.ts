import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';
import { isProActive } from '@elementor/utils';

import { MANAGE_VARIABLES_GUIDE_URI } from './variable-tool-prompt';
import { GLOBAL_VARIABLES_URI } from './variables-resource';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
const TOOL_NAME = 'manage-global-variable';

const VARIABLE_TYPES = {
	COLOR: 'global-color-variable',
	FONT: 'global-font-variable',
	SIZE: 'global-size-variable',
	CUSTOM_SIZE: 'global-custom-size-variable',
} as const;

export const initManageVariableTool = ( reg: MCPRegistryEntry ) => {
	const { addTool, resource } = reg;
	const RUNTIME_ALLOWED_VARIABLE_TYPES = isProActive()
		? ( [ VARIABLE_TYPES.COLOR, VARIABLE_TYPES.FONT, VARIABLE_TYPES.SIZE, VARIABLE_TYPES.CUSTOM_SIZE ] as const )
		: ( [ VARIABLE_TYPES.COLOR, VARIABLE_TYPES.FONT ] as const );

	resource(
		'manage-global-variable-guide',
		MANAGE_VARIABLES_GUIDE_URI,
		{
			title: 'Manage Global Variable Guide',
			description: 'Detailed guide for using the manage-global-variable tool',
			mimeType: 'text/plain',
		},
		async ( uri: URL ) => {
			const { data } = await httpService().get< HttpResponse< string > >( MCP_PROXY_URL, {
				params: { uri: uri.href },
			} );

			return {
				contents: [ { uri: uri.href, mimeType: 'text/plain', text: data.data } ],
			};
		}
	);

	addTool( {
		name: TOOL_NAME,
		description:
			'Manage V4 global variables (color, font, size, custom-size). Read the guide resource before use. font = font-famliy, size = measured unit, custom-size = calculated values',
		schema: {
			action: z.enum( [ 'create', 'update', 'delete' ] ),
			id: z
				.string()
				.optional()
				.describe( 'Variable id — required for update/delete. Get from the global-variables resource.' ),
			type: z.enum( RUNTIME_ALLOWED_VARIABLE_TYPES ),
			label: z.string().describe( 'Variable label (lowercase, dash-separated) — required for create/update.' ),
			value: z
				.string()
				.optional()
				.describe(
					'Plain CSS value — required for create/update. Color: hex/rgba/hsl. Font: family name only. Size: value with unit e.g. "16px", or "auto" (Pro). Do NOT pass JSON.'
				),
		},
		outputSchema: {
			status: z.enum( [ 'ok' ] ).describe( 'Operation status' ),
			message: z.string().optional().describe( 'Error details if status is error' ),
		},
		requiredResources: [
			{ uri: MANAGE_VARIABLES_GUIDE_URI, description: 'Full guide for variable types, naming rules, and usage' },
			{
				uri: GLOBAL_VARIABLES_URI,
				description: 'Current global variables — check before creating to avoid duplicates',
			},
		],
		isDestructive: true,
		handler: async ( params ) => {
			await httpService().post( MCP_PROXY_URL, {
				tool: TOOL_NAME,
				input: params,
			} );

			return { status: 'ok' };
		},
	} );
};
