import { generateId, type StyleDefinitionVariant } from '@elementor/editor-styles';
import { createStylesProvider } from '@elementor/editor-styles-repository';
import {
	__dispatch as dispatch,
	__getState as getState,
	__subscribeWithSelector as subscribeWithSelector,
} from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { selectClass, selectClasses, slice, type ComponentsStylesState } from './store';

export const COMPONENTS_PROVIDER_KEY = 'components-styles';

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
