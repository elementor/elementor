import { __getState as getState, __subscribeWithSelector as subscribeWithSelector } from '@elementor/store';

import { selectFlatData, SLICE_NAME } from '../store/initial-documents-styles-store';
import { createStylesProvider } from '../utils/create-styles-provider';

export const InitialDocumentsStylesProvider = createStylesProvider( {
	key: 'initial-documents-styles',
	priority: 100,
	subscribe: ( cb ) =>
		subscribeWithSelector(
			( state ) => state[ SLICE_NAME ],
			() => {
				cb();
			}
		),
	actions: {
		all: () => {
			return selectFlatData( getState() );
		},
		get: ( id ) => {
			return selectFlatData( getState() ).find( ( style ) => style.id === id ) ?? null;
		},
	},
} );
