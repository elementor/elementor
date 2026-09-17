import { createTransformer, formatGridTrackRepeat, isGridTrackProperty } from '@elementor/editor-canvas';

import { service } from '../service';
import { type TVariable } from '../storage';
import { resolveCssVariable } from './utils/resolve-css-variable';

export const variableTransformer = createTransformer( ( idOrLabel: string, { key }: { key: string } ) => {
	const variables = service.variables();

	const targetVariable: TVariable | null = variables[ idOrLabel ] || service.findVariableByLabel( idOrLabel );

	if ( ! targetVariable ) {
		return null;
	}

	if ( isGridTrackProperty( key ) ) {
		const count = parseInt( ( targetVariable.value ?? '' ).trim(), 10 );

		return formatGridTrackRepeat( count );
	}

	const id = service.findIdByLabel( targetVariable.label );
	return resolveCssVariable( id, targetVariable );
} );
