import { getMCPByDomain } from '@elementor/editor-mcp';

import { globalClassesStylesProvider } from '../global-classes-styles-provider';

export const GLOBAL_CLASSES_URI = 'elementor://global-classes';

export const initClassesResource = () => {
	const { mcpServer } = getMCPByDomain( 'canvas' );

	mcpServer.resource(
		'global-classes',
		GLOBAL_CLASSES_URI,
		{
			description: 'Global classes list.',
		},
		async () => {
			return {
				contents: [ { uri: GLOBAL_CLASSES_URI, text: localStorage[ 'elementor-global-classes' ] ?? {} } ],
			};
		}
	);

	globalClassesStylesProvider.subscribe( () => {
		mcpServer.sendResourceListChanged();
	} );
};
