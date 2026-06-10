import { useMemo } from 'react';
import { getStylesSchema } from '@elementor/editor-styles';
import { enqueueFont } from '@elementor/editor-v1-adapters';

import { createPropsResolver } from '../renderers/create-props-resolver';
import { maybeEnqueueFontFromStyleProp } from '../renderers/enqueue-font-from-style-prop';
import { styleTransformersRegistry } from '../style-transformers-registry';

export function useStylePropResolver() {
	return useMemo( () => {
		return createPropsResolver( {
			transformers: styleTransformersRegistry,
			schema: getStylesSchema(),
			onPropResolve: ( { propValue, propType } ) => {
				maybeEnqueueFontFromStyleProp( propType, propValue, enqueueFont );
			},
		} );
	}, [] );
}
