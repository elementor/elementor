import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type StyleDefinition } from '@elementor/editor-styles';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';
import { __dispatch as dispatch } from '@elementor/store';

import { globalClassesStylesProvider } from '../global-classes-styles-provider';
import { slice } from '../store';
import { GLOBAL_CLASSES_URI } from './classes-resource';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
const TOOL_NAME = 'manage-classes';

type ManageClassesResponse = {
	status: string;
	class?: StyleDefinition;
	order?: string[];
};

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
			const { data } = await httpService().post< HttpResponse< ManageClassesResponse > >( MCP_PROXY_URL, {
				tool: TOOL_NAME,
				input: params,
			} );

			const payload = data.data;
			const { create, update, delete: del } = globalClassesStylesProvider.actions;

			switch ( params.action ) {
				case 'create':
					if ( payload.class && create ) {
						create( payload.class.label, payload.class.variants, payload.class.id );
					}
					break;
				case 'update':
					if ( payload.class && update ) {
						update( payload.class );
					}
					break;
				case 'delete':
					if ( params.id && del ) {
						del( params.id );
					}
					break;
			}

			dispatch( slice.actions.reset( { context: 'frontend' } ) );
			window.dispatchEvent( new CustomEvent( 'classes:updated', { detail: { context: 'frontend' } } ) );

			return { status: 'ok' };
		},
	} );
};
