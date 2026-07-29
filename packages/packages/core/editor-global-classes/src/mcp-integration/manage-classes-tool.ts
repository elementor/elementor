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
	results?: StyleDefinition[];
	order?: string[];
};

export const initManageClassesTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: TOOL_NAME,
		description:
			'Manage V4 global CSS classes on the active kit. Create, update, or delete a single class. Supports per-breakpoint and pseudo-class styles via the styles field.',
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
				.describe( 'Flat property → value map for CSS declarations. Ignored when styles is present.' ),
			styles: z
				.record( z.string().nullable() )
				.optional()
				.describe(
					'Map of breakpoint key to CSS string. Use "default" for desktop. Supports &:hover / &:focus / &:active nesting. Takes precedence over css. Pass null for a breakpoint key to remove all its variants.'
				),
			mode: z
				.enum( [ 'patch', 'replace' ] )
				.optional()
				.describe(
					'Merge strategy for update — patch (default): merge incoming props with existing; replace: discard all existing variants for the affected breakpoints.'
				),
		},
		outputSchema: {
			status: z.enum( [ 'ok' ] ).describe( 'Operation status' ),
			id: z.string().optional().describe( 'ID of the affected class — use for subsequent update/delete calls.' ),
			label: z.string().optional().describe( 'Final label of the class after any auto-rename.' ),
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
				input: { operations: [ params ] },
			} );

			const result = data.data.results?.[ 0 ];
			const { create, update, delete: del } = globalClassesStylesProvider.actions;

			switch ( params.action ) {
				case 'create':
					if ( result && create ) {
						create( result.label, result.variants, result.id );
					}
					break;
				case 'update':
					if ( result && update ) {
						update( result );
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

			return {
				status: 'ok' as const,
				id: result?.id,
				label: result?.label,
			};
		},
	} );
};
