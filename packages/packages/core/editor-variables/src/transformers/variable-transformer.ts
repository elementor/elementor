import { createTransformer } from '@elementor/editor-canvas';

import { service } from '../service';
import { resolveCssVariable } from './utils/resolve-css-variable';

export const variableTransformer = createTransformer( ( id: string ) => {
	const variables = service.variables();

	if ( ! variables[ id ] ) {
		return null;
	}

	return resolveCssVariable( id, variables[ id ] );
} );
