import { getWidgetsCache } from '@elementor/editor-elements';

import { createStylesProvider } from '../utils/create-styles-provider';

export const ELEMENTS_BASE_STYLES_PROVIDER_KEY = 'element-base-styles';

export const elementBaseStylesProvider = createStylesProvider( {
	key: ELEMENTS_BASE_STYLES_PROVIDER_KEY,
	actions: {
		all() {
			const widgetsCache = getWidgetsCache();

			return Object.values( widgetsCache ?? {} ).flatMap( ( widget ) =>
				Object.values( widget.base_styles ?? {} )
			);
		},

		get( id ) {
			return this.all().find( ( style ) => style.id === id ) ?? null;
		},
	},
} );
