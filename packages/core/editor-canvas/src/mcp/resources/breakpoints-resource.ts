import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type ExtendedWindow } from '@elementor/editor-responsive';
import { v1ReadyEvent } from '@elementor/editor-v1-adapters';

export const BREAKPOINTS_SCHEMA_URI = 'elementor://breakpoints/list';

export const initBreakpointsResource = ( reg: MCPRegistryEntry ) => {
	const { mcpServer, sendResourceUpdated } = reg;

	const getBreakpointsList = () => {
		const { breakpoints } = ( window as unknown as ExtendedWindow ).elementor?.config?.responsive || {};
		if ( ! breakpoints ) {
			return [];
		}
		return Object.values( breakpoints )
			.filter( ( bp ) => bp.is_enabled )
			.map( ( bp ) => {
				const { direction: constraint, label, value } = bp;
				return {
					label,
					constraint,
					value,
				};
			} );
	};

	const buildResourceResponse = () => ( {
		contents: [
			{
				uri: BREAKPOINTS_SCHEMA_URI,
				mimeType: 'application/json',
				text: JSON.stringify( getBreakpointsList() ),
			},
		],
	} );

	mcpServer.resource( 'breakpoints ', BREAKPOINTS_SCHEMA_URI, () => {
		return buildResourceResponse();
	} );

	window.addEventListener( v1ReadyEvent().name, () => {
		sendResourceUpdated( {
			uri: BREAKPOINTS_SCHEMA_URI,
			...buildResourceResponse(),
		} );
	} );
};
