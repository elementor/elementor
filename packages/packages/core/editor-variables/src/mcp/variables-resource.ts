import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { __privateListenTo as listenTo, commandEndEvent } from '@elementor/editor-v1-adapters';

import { service } from '../service';
import { type TVariable } from '../storage';

export const GLOBAL_VARIABLES_URI = 'elementor://global-variables';

type GlobalVariablesResourceEntry =
	| ( TVariable & { version: 'v4' } )
	| ( Record< string, unknown > & { version: 'v3' } );

const buildGlobalVariablesPayload = async (): Promise< Record< string, GlobalVariablesResourceEntry > > => {
	const merged: Record< string, GlobalVariablesResourceEntry > = {};
	Object.entries( service.variables() ).forEach( ( [ id, variable ] ) => {
		if ( ! variable.deleted ) {
			merged[ id ] = { ...variable, version: 'v4' };
		}
	} );
	return merged;
};

export const initVariablesResource = ( variablesMcpEntry: MCPRegistryEntry, canvasMcpEntry: MCPRegistryEntry ) => {
	[ canvasMcpEntry, variablesMcpEntry ].forEach( ( entry ) => {
		const { resource, sendResourceUpdated } = entry;

		const notifyGlobalVariablesUpdated = () => {
			sendResourceUpdated( {
				uri: GLOBAL_VARIABLES_URI,
			} );
		};

		resource(
			'global-variables',
			GLOBAL_VARIABLES_URI,
			{
				description: 'Global variables available (v4)',
			},
			async () => {
				const variables = await buildGlobalVariablesPayload();

				return {
					contents: [
						{ uri: GLOBAL_VARIABLES_URI, mimeType: 'application/json', text: JSON.stringify( variables ) },
					],
				};
			}
		);

		window.addEventListener( 'variables:updated', notifyGlobalVariablesUpdated );

		listenTo( commandEndEvent( 'document/save/update' ), notifyGlobalVariablesUpdated );
	} );
};
