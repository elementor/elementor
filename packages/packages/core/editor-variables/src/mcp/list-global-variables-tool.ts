import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';
import { isProActive } from '@elementor/utils';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
const TOOL_NAME = 'list-global-variables';

const VARIABLE_TYPES = {
	COLOR: 'global-color-variable',
	FONT: 'global-font-variable',
	SIZE: 'global-size-variable',
	CUSTOM_SIZE: 'global-custom-size-variable',
} as const;

type ListGlobalVariablesResponse = {
	variables: Array< Record< string, unknown > & { id: string; label: string; type: string } >;
	total: number;
	page: number;
	per_page: number;
	watermark: number | null;
};

export const initListGlobalVariablesTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;
	const RUNTIME_ALLOWED_VARIABLE_TYPES = isProActive()
		? ( [ VARIABLE_TYPES.COLOR, VARIABLE_TYPES.FONT, VARIABLE_TYPES.SIZE, VARIABLE_TYPES.CUSTOM_SIZE ] as const )
		: ( [ VARIABLE_TYPES.COLOR, VARIABLE_TYPES.FONT ] as const );

	addTool( {
		name: TOOL_NAME,
		description:
			'List V4 global variables from the active kit with optional search, type filter, and pagination. Call before styling with var(--label) or before manage-global-variable.',
		schema: {
			search: z
				.string()
				.optional()
				.describe( 'Optional keyword matched against variable labels (case-insensitive substring).' ),
			type: z
				.enum( RUNTIME_ALLOWED_VARIABLE_TYPES )
				.optional()
				.describe( 'Optional filter by variable type.' ),
			page: z.number().int().min( 1 ).optional().describe( 'Page number (default 1).' ),
			per_page: z
				.number()
				.int()
				.min( 1 )
				.max( 50 )
				.optional()
				.describe( 'Items per page (default 20, max 50).' ),
		},
		outputSchema: {
			variables: z.array(
				z.object( {
					id: z.string(),
					type: z.string(),
					label: z.string(),
					value: z.string().optional(),
				} )
			),
			total: z.number(),
			page: z.number(),
			per_page: z.number(),
			watermark: z.number().nullable().optional(),
		},
		handler: async ( params ) => {
			const { data } = await httpService().post< HttpResponse< ListGlobalVariablesResponse > >( MCP_PROXY_URL, {
				tool: TOOL_NAME,
				input: params,
			} );

			return data.data;
		},
	} );
};
