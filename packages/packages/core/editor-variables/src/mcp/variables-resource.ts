import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { __privateListenTo as listenTo, commandEndEvent } from '@elementor/editor-v1-adapters';
import { type HttpResponse, httpService } from '@elementor/http-client';

import { STORAGE_UPDATED_EVENT } from '../storage';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';
export const GLOBAL_VARIABLES_URI = 'elementor://global-variables';

export const initVariablesResource = ( variablesMcpEntry: MCPRegistryEntry, canvasMcpEntry: MCPRegistryEntry ) => {
	[ canvasMcpEntry, variablesMcpEntry ].forEach( ( entry ) => {
		const { resource, sendResourceUpdated } = entry;

		const notifyGlobalVariablesUpdated = () => {
			sendResourceUpdated( { uri: GLOBAL_VARIABLES_URI } );
		};

		resource(
			'global-variables',
			GLOBAL_VARIABLES_URI,
			{
				description: 'Global variables available (v4)',
			},
			async ( uri: URL ) => {
				const { data } = await httpService().get< HttpResponse< Record< string, unknown > > >( MCP_PROXY_URL, {
					params: { uri: uri.href },
				} );

				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'application/json',
							text: JSON.stringify( data.data ?? {} ),
						},
					],
				};
			}
		);

		window.addEventListener( STORAGE_UPDATED_EVENT, notifyGlobalVariablesUpdated );

		listenTo( commandEndEvent( 'document/save/update' ), notifyGlobalVariablesUpdated );
	} );
};
