import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type ExtendedWindow } from '@elementor/editor-responsive';

export const BREAKPOINTS_SCHEMA_URI = 'elementor://breakpoints/list';

const getBreakpointsList = () => {
	const { breakpoints } = ( window as unknown as ExtendedWindow ).elementor?.config?.responsive || {};

	return Object.values( breakpoints ?? {} )
		.filter( ( bp ) => bp.is_enabled )
		.map( ( { direction: constraint, label, value } ) => ( { label, constraint, value } ) );
};

export const initBreakpointsResource = ( reg: MCPRegistryEntry ) => {
	const { resource } = reg;

	resource(
		'breakpoints',
		BREAKPOINTS_SCHEMA_URI,
		{
			description: 'Breakpoints list.',
		},
		async () => ( {
			contents: [
				{
					uri: BREAKPOINTS_SCHEMA_URI,
					mimeType: 'application/json',
					text: JSON.stringify( getBreakpointsList() ),
				},
			],
		} )
	);
};
