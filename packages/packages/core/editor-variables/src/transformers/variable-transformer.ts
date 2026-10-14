import { createTransformer, formatGridTrackRepeat, isGridTrackProperty } from '@elementor/editor-canvas';

import { service } from '../service';
import { type TVariable } from '../storage';
import { resolveCssVariable } from './utils/resolve-css-variable';

const STATE_VARIABLE_PATTERN = /^e-state-[a-z_][a-z0-9_]*$/;

export const variableTransformer = createTransformer( ( idOrLabel: string, { key }: { key: string } ) => {
	if ( STATE_VARIABLE_PATTERN.test( idOrLabel ) ) {
		return `var(--${ idOrLabel })`;
	}

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
