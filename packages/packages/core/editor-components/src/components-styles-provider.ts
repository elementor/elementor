import { createStylesProvider } from '@elementor/editor-styles-repository';
import { __getState as getState, __subscribeWithSelector as subscribeWithSelector } from '@elementor/store';

import { type ComponentsStylesState, selectClass, selectClasses } from './store';

const COMPONENTS_PROVIDER_KEY = 'components-styles';

export const componentsStylesProvider = createStylesProvider( {
	key: COMPONENTS_PROVIDER_KEY,
	priority: 50,
	subscribe: ( cb ) => subscribeWithSelector( ( state: ComponentsStylesState ) => state.data, cb ),
	actions: {
		all: () => {
			return selectClasses( getState() );
		},
		get: ( id ) => selectClass( getState(), id ),
	},
} );
