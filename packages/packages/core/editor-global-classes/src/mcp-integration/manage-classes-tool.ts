import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';

import { loadCurrentDocumentClasses } from '../load-document-classes';
import { GLOBAL_CLASSES_URI } from './classes-resource';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
const TOOL_NAME = 'manage-classes';

export const initManageClassesTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: TOOL_NAME,
		description:
			'Manage V4 global CSS classes on the active kit. Create, update, or delete a single class using raw CSS declarations.',
		schema: {
			action: z.enum( [ 'create', 'update', 'delete' ] ),
			id: z
				.string()
				.optional()
				.describe( 'Class id — required for update/delete. Get from the global-classes resource.' ),
			label: z
				.string()
				.optional()
				.describe( 'Class label (lowercase, dash-separated) — required for create/update.' ),
			css: z
				.record( z.string() )
				.optional()
				.describe( 'Raw CSS declarations (property → value) — required for create/update.' ),
		},
		outputSchema: {
			status: z.enum( [ 'ok' ] ).describe( 'Operation status' ),
		},
		requiredResources: [
			{
				uri: GLOBAL_CLASSES_URI,
				description: 'Current global classes — check before creating to avoid duplicates',
			},
		],
		isDestructive: true,
		handler: async ( params ) => {
			await httpService().post( MCP_PROXY_URL, {
				tool: TOOL_NAME,
				input: params,
			} );

			await loadCurrentDocumentClasses();

			return { status: 'ok' };
		},
	} );
};
