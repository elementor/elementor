import { getMCPByDomain } from '@elementor/editor-mcp';

import { globalClassesStylesProvider } from '../global-classes-styles-provider';

export const GLOBAL_CLASSES_URI = 'elementor://global-classes';

export const initClassesResource = () => {
	const { resource, waitForReady, sendResourceUpdated } = getMCPByDomain( 'canvas' );
	const {
		resource: classesResource,
		waitForReady: classesWaitForReady,
		sendResourceUpdated: classesSendResourceUpdated,
	} = getMCPByDomain( 'classes' );

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

	classesResource(
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

	waitForReady().then( () => {
		globalClassesStylesProvider.subscribe( () => {
			sendResourceUpdated( {
				uri: GLOBAL_CLASSES_URI,
				contents: [ { uri: GLOBAL_CLASSES_URI, text: localStorage[ 'elementor-global-classes' ] ?? {} } ],
			} );
		} );
	} );

	classesWaitForReady().then( () => {
		globalClassesStylesProvider.subscribe( () => {
			classesSendResourceUpdated( {
				uri: GLOBAL_CLASSES_URI,
				contents: [ { uri: GLOBAL_CLASSES_URI, text: localStorage[ 'elementor-global-classes' ] ?? {} } ],
			} );
		} );
	} );
};
