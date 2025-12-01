import { getMCPByDomain } from '@elementor/editor-mcp';

export const GLOBAL_VARIABLES_URI = 'elementor://variables';

export const initVariablesResource = () => {
	const { mcpServer } = getMCPByDomain( 'variables' );

	mcpServer.resource(
		'global-variables',
		GLOBAL_VARIABLES_URI,
		{
			description:
				'Global variables list. Variables are being used in this way: If it is directly in the schema, you need to put the ID which is the key inside the object.',
		},
		async () => {
			return {
				contents: [ { uri: GLOBAL_VARIABLES_URI, text: localStorage[ 'elementor-global-variables' ] } ],
			};
		}
	);

	window.addEventListener( 'variables:updated', () => {
		mcpServer.server.sendResourceUpdated( {
			uri: GLOBAL_VARIABLES_URI,
			contents: [ { uri: GLOBAL_VARIABLES_URI, text: localStorage[ 'elementor-global-variables' ] } ],
		} );
	} );
};
