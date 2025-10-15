import { createStylesProvider } from '@elementor/editor-styles-repository';
import { __getState as getState, __subscribeWithSelector as subscribeWithSelector } from '@elementor/store';

import { selectFlatStyles, SLICE_NAME } from './store';

export const componentsStylesProvider = createStylesProvider( {
	key: 'components-styles',
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
			return selectFlatStyles( getState() );
		},
		get: ( id ) => {
			return selectFlatStyles( getState() ).find( ( style ) => style.id === id ) ?? null;
		},
	},
} );
