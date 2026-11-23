import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type StyleDefinition } from '@elementor/editor-styles';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';

import { defaultStylesStylesProvider } from '../default-styles-provider';
import {
	getPendingAbilityOperations,
	recordPendingDefaultStylesOperation,
	type DefaultStylesAbilityOperation,
} from './pending-default-styles-changes';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
const TOOL_NAME = 'manage-default-styles';
const MAX_OPERATIONS_PER_REQUEST = 20;

type ManageDefaultStylesResult = Partial< StyleDefinition > & {
	status: 'ok' | 'error';
	tag?: string;
	message?: string;
};

type ManageDefaultStylesResponse = {
	status: string;
	results?: ManageDefaultStylesResult[];
};

type ManageDefaultStylesParams = DefaultStylesAbilityOperation & {
	css?: string;
};

export const initManageDefaultStylesTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: TOOL_NAME,
		description:
			'Manage V4 site-wide default styles on the active kit, keyed by HTML wrapper tag (h1..h6, p, a, section, div, ...). Update or delete using raw CSS declarations (up to 20 operations).',
		schema: {
			action: z.enum( [ 'update', 'delete' ] ),
			tag: z.string().describe( 'HTML wrapper tag to target (e.g. h1, h2, p, a).' ),
			css: z
				.string()
				.optional()
				.describe(
					'Plain CSS string. Supports &:hover/&:focus/&:active nesting and @media(--breakpoint) blocks. font-family must be a single Google Font name (no fallback stacks). In patch mode: "prop: null" removes that prop; "all: null" wipes the variant. Required for update.'
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
			tag: z.string().describe( 'HTML tag of the affected default style.' ),
		},
		isDestructive: true,
		handler: async ( params ) => {
			const pendingOperations = getPendingAbilityOperations();

			if ( pendingOperations.length >= MAX_OPERATIONS_PER_REQUEST ) {
				throw new Error( 'Too many unsaved default style changes. Save the kit, then try again.' );
			}

			const { data } = await httpService().post< HttpResponse< ManageDefaultStylesResponse > >( MCP_PROXY_URL, {
				tool: TOOL_NAME,
				input: { operations: [ ...pendingOperations, params ], dry_run: true },
			} );

			const result = data.data.results?.[ pendingOperations.length ];

			if ( result?.status !== 'ok' ) {
				throw new Error( result?.message || 'Unexpected response from server' );
			}

			applyPlannedDefaultStylesChange( params, result );

			return {
				status: 'ok' as const,
				tag: result.tag ?? params.tag,
			};
		},
	} );
};

const applyPlannedDefaultStylesChange = (
	params: ManageDefaultStylesParams,
	result: ManageDefaultStylesResult
) => {
	applyInEditor( params.action, result );
	recordPendingDefaultStylesOperation( params );
};

const applyInEditor = ( action: 'update' | 'delete', result: ManageDefaultStylesResult ) => {
	const { update, delete: remove } = defaultStylesStylesProvider.actions;
	const tag = result.tag;

	if ( ! tag ) {
		throw new Error( 'Default style tag is missing from the response' );
	}

	switch ( action ) {
		case 'update':
			if ( ! result.type || ! result.variants ) {
				throw new Error( 'Planned default style is incomplete in the response' );
			}

			update?.( {
				id: tag,
				label: tag,
				type: result.type,
				variants: result.variants,
			} );
			break;
		case 'delete':
			remove?.( tag );
			break;
	}
};