import { type MCPRegistryEntry } from '@elementor/editor-mcp';

import { service } from '../service';
import { type TVariable } from '../storage';

export const GLOBAL_VARIABLES_URI = 'elementor://global-variables';

export const initVariablesResource = ( variablesMcpEntry: MCPRegistryEntry, canvasMcpEntry: MCPRegistryEntry ) => {
	[ canvasMcpEntry, variablesMcpEntry ].forEach( ( entry ) => {
		const { resource, sendResourceUpdated } = entry;
		resource(
			'global-variables',
			GLOBAL_VARIABLES_URI,
			{
				description:
					'List of Global variables. Defined as a key-value store (ID as key, global-variable object as value)',
			},
			async () => {
				const variables: Record< string, TVariable > = {};
				Object.entries( service.variables() ).forEach( ( [ id, variable ] ) => {
					if ( ! variable.deleted ) {
						variables[ id ] = variable;
					}
				} );

				return {
					contents: [ { uri: GLOBAL_VARIABLES_URI, text: JSON.stringify( variables ) } ],
				};
			}
		);

		window.addEventListener( 'variables:updated', () => {
			sendResourceUpdated( {
				uri: GLOBAL_VARIABLES_URI,
			} );
		} );
	} );
};
