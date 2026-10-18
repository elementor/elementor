import { createTransformer, formatGridTrackRepeat, isGridTrackProperty } from '@elementor/editor-canvas';

import { service } from '../service';
import { type TVariable } from '../storage';
import { resolveCssVariable } from './utils/resolve-css-variable';

const GRID_TRACK_COUNT_PATTERN = /^\d+(\.\d+)?\s*(fr)?$/i;

export const variableTransformer = createTransformer( ( idOrLabel: string, { key }: { key: string } ) => {
	const variables = service.variables();

	const targetVariable: TVariable | null = variables[ idOrLabel ] || service.findVariableByLabel( idOrLabel );

	if ( ! targetVariable ) {
		return null;
	}

	if ( isGridTrackProperty( key ) ) {
		const trackValue = ( targetVariable.value ?? '' ).trim();

		// Only a plain count like "3" or "3fr" becomes repeat(), other values are full track lists.
		if ( GRID_TRACK_COUNT_PATTERN.test( trackValue ) ) {
			return formatGridTrackRepeat( parseInt( trackValue, 10 ) );
		}
	}

	const id = service.findIdByLabel( targetVariable.label );
	return resolveCssVariable( id, targetVariable );
} );
