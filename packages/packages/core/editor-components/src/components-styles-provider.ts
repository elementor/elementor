import { createStylesProvider } from '@elementor/editor-styles-repository';
import { __getState as getState, __subscribeWithSelector as subscribeWithSelector } from '@elementor/store';

import { selectFlatData, SLICE_NAME } from './store/components-styles-store';

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
			return selectFlatData( getState() );
		},
		get: ( id ) => {
			return selectFlatData( getState() ).find( ( style ) => style.id === id ) ?? null;
		},
	},
} );
