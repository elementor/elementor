import { getMCPByDomain } from '@elementor/editor-mcp';

import { service } from '../service';
import { type TVariable } from '../storage';

export const GLOBAL_VARIABLES_URI = 'elementor://global-variables';
export const GLOBAL_VARIABLES_RAW_CSS_URI = 'elementor://global-variables-raw-css';

export const initVariablesResource = () => {
	const { mcpServer } = getMCPByDomain( 'canvas' );

	mcpServer.resource(
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

	mcpServer.resource(
		'global-variables-raw-css',
		GLOBAL_VARIABLES_RAW_CSS_URI,
		{
			description:
				'Raw CSS of Global variables. The variable names are the same as the ones in the global-variables resource.',
		},
		async () => {
			return {
				contents: [ { uri: GLOBAL_VARIABLES_RAW_CSS_URI, text: window.elementorVariablesRawCSS ?? '' } ],
			};
		}
	);

	window.addEventListener( 'variables:updated', () => {
		mcpServer.server.sendResourceUpdated( {
			uri: GLOBAL_VARIABLES_URI,
			contents: [ { uri: GLOBAL_VARIABLES_URI, text: localStorage[ 'elementor-global-variables' ] } ],
		} );
		mcpServer.server.sendResourceUpdated( {
			uri: GLOBAL_VARIABLES_RAW_CSS_URI,
			contents: [ { uri: GLOBAL_VARIABLES_RAW_CSS_URI, text: window.elementorVariablesRawCSS ?? '' } ],
		} );
	} );
};
