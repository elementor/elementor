import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { __getState as getState } from '@elementor/store';

import { globalClassesStylesProvider } from '../global-classes-styles-provider';
import { selectOrderedClasses } from '../store';

export const GLOBAL_CLASSES_URI = 'elementor://global-classes';

const STORAGE_KEY = 'elementor-global-classes';

const updateLocalStorageCache = () => {
	const classes = selectOrderedClasses( getState() );

	localStorage.setItem( STORAGE_KEY, JSON.stringify( classes ) );
};

export const initClassesResource = ( classesMcpEntry: MCPRegistryEntry, canvasMcpEntry: MCPRegistryEntry ) => {
	[ canvasMcpEntry, classesMcpEntry ].forEach( ( entry ) => {
		const { sendResourceUpdated, resource, waitForReady } = entry;
		resource(
			'global-classes',
			GLOBAL_CLASSES_URI,
			{
				description: 'Global classes list.',
			},
			async () => {
				return {
					contents: [ { uri: GLOBAL_CLASSES_URI, text: localStorage[ STORAGE_KEY ] ?? '[]' } ],
				};
			}
		);
		waitForReady().then( () => {
			updateLocalStorageCache();
			globalClassesStylesProvider.subscribe( () => {
				updateLocalStorageCache();
				sendResourceUpdated( { uri: GLOBAL_CLASSES_URI } );
			} );
		} );
	} );
};
