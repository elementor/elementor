import { getMCPByDomain } from '@elementor/editor-mcp';

import { globalClassesStylesProvider } from '../global-classes-styles-provider';
import { getRawGlobalClassesCSS } from '../utils/get-raw-global-classes';

export const GLOBAL_CLASSES_URI = 'elementor://global-classes';
export const GLOBAL_CLASSES_RAW_CSS_URI = 'elementor://global-classes-raw-css';

export const initClassesResource = () => {
	const { mcpServer, resource, waitForReady } = getMCPByDomain( 'canvas' );

	resource(
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

	resource(
		'global-classes-raw-css',
		GLOBAL_CLASSES_RAW_CSS_URI,
		{
			description: 'Raw CSS of Global classes.',
		},
		async () => {
			return {
				contents: [ { uri: GLOBAL_CLASSES_RAW_CSS_URI, text: getRawGlobalClassesCSS() } ],
			};
		}
	);

	waitForReady().then( () => {
		globalClassesStylesProvider.subscribe( () => {
			mcpServer.sendResourceListChanged();
		} );
	} );
};
