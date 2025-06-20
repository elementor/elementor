import { useMemo } from 'react';
import { getStylesSchema } from '@elementor/editor-styles';

import { createPropsResolver } from '../renderers/create-props-resolver';
import { styleTransformersRegistry } from '../style-transformers-registry';
import { enqueueFont } from '../sync/enqueue-font';

export function useStylePropResolver() {
	return useMemo( () => {
		return createPropsResolver( {
			transformers: styleTransformersRegistry,
			schema: getStylesSchema(),
			onPropResolve: ( { key, value } ) => {
				if ( key !== 'font-family' || typeof value !== 'string' ) {
					return;
				}

				enqueueFont( value );
			},
		} );
	}, [] );
}
