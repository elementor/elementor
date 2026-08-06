import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
const TOOL_NAME = 'list-global-classes';

type ListGlobalClassesResponse = {
	classes: Array< { id: string; label: string } >;
	total: number;
	page: number;
	per_page: number;
};

export const initListGlobalClassesTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: TOOL_NAME,
		description:
			'List V4 global CSS classes from the active kit (id + label) with optional search and pagination. Call before composing, manage-classes, or apply-global-class.',
		schema: {
			search: z
				.string()
				.optional()
				.describe( 'Optional keyword matched against class labels (case-insensitive substring).' ),
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
			classes: z.array(
				z.object( {
					id: z.string(),
					label: z.string(),
				} )
			),
			total: z.number(),
			page: z.number(),
			per_page: z.number(),
		},
		handler: async ( params ) => {
			const { data } = await httpService().post< HttpResponse< ListGlobalClassesResponse > >( MCP_PROXY_URL, {
				tool: TOOL_NAME,
				input: params,
			} );

			return data.data;
		},
	} );
};
