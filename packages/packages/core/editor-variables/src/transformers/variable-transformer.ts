import { createTransformer } from '@elementor/editor-canvas';

import { service } from '../service';

export const variableTransformer = createTransformer( ( value: string ) => {
	const variables = service.variables();

	let name = value;

	if ( variables[ value ] && ! variables[ value ]?.deleted ) {
		name = variables[ value ]?.label;
	}

	if ( ! name.trim() ) {
		return null;
	}

	return `var(--${ name })`;
} );
