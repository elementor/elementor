import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';
import { __getState as getState } from '@elementor/store';

import { defaultStylesStylesProvider } from '../default-styles-provider';
import { selectData, selectInitialData, type StateWithDefaultStyles } from '../store';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
const TOOL_NAME = 'manage-default-styles';

type ManageDefaultStylesResult = Partial< StyleDefinition > & {
	status: 'ok' | 'error';
	tag?: string;
	message?: string;
};

type ManageDefaultStylesResponse = {
	status: string;
	results?: ManageDefaultStylesResult[];
};

type ManageDefaultStylesParams = {
	action: 'update' | 'delete';
	tag: string;
	css?: string;
	mode?: 'patch' | 'replace';
};

type EditorDefaultStylesSnapshot = Record<
	string,
	{
		type: StyleDefinition[ 'type' ];
		variants: StyleDefinition[ 'variants' ];
	}
>;

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
			const editorDefaultStyles = buildEditorDefaultStylesSnapshot( params.tag );

			const { data } = await httpService().post< HttpResponse< ManageDefaultStylesResponse > >( MCP_PROXY_URL, {
				tool: TOOL_NAME,
				input: {
					operations: [ params ],
					dry_run: true,
					editor_default_styles: editorDefaultStyles,
				},
			} );

			const result = data.data.results?.[ 0 ];

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

const buildEditorDefaultStylesSnapshot = ( tag: string ): EditorDefaultStylesSnapshot => {
	const state = getState() as StateWithDefaultStyles;
	const style = selectData( state )[ tag ];

	if ( style ) {
		return {
			[ tag ]: {
				type: style.type,
				variants: style.variants,
			},
		};
	}

	const initialStyle = selectInitialData( state )[ tag ];

	if ( initialStyle ) {
		return {
			[ tag ]: {
				type: initialStyle.type,
				variants: [],
			},
		};
	}

	return {};
};

const applyPlannedDefaultStylesChange = ( params: ManageDefaultStylesParams, result: ManageDefaultStylesResult ) => {
	applyInEditor( params.action, result );
	runCommandSync( 'document/save/set-is-modified', { status: true }, { internal: true } );
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
