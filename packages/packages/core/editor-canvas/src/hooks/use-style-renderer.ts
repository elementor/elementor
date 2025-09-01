import { useMemo } from 'react';
import { useBreakpointsMap } from '@elementor/editor-responsive';

import { type PropsResolver } from '../renderers/create-props-resolver';
import { createStylesRenderer } from '../renderers/create-styles-renderer';

const SELECTOR_PREFIX = '.elementor';

export function useStyleRenderer( resolve: PropsResolver ) {
	const breakpoints = useBreakpointsMap();

	return useMemo( () => {
		return createStylesRenderer( {
			selectorPrefix: SELECTOR_PREFIX,
			breakpoints,
			resolve,
		} );
	}, [ resolve, breakpoints ] );
}
