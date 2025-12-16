import { createTransformer } from '@elementor/editor-canvas';

import { service } from '../service';
import { type TVariable } from '../storage';
import { resolveCssVariable } from './utils/resolve-css-variable';

export const variableTransformer = createTransformer( ( idOrLabel: string ) => {
	const variables = service.variables();

	const targetVariable: TVariable | null = variables[ idOrLabel ] || service.findVariableByLabel( idOrLabel );
	if ( ! targetVariable ) {
		return null;
	}
	const id = service.findIdByLabel( targetVariable.label );

	return resolveCssVariable( id, targetVariable );
} );
