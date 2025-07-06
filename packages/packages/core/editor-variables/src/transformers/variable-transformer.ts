import { createTransformer } from '@elementor/editor-canvas';

import { service } from '../service';

export const variableTransformer = createTransformer( ( id: string ) => {
	const variables = service.variables();

	let name = id;
	let fallbackValue = '';

	if ( variables[ id ] ) {
		fallbackValue = variables[ id ].value;
		if ( ! variables[ id ]?.deleted ) {
			name = variables[ id ].label;
		}
	}

	if ( ! name.trim() ) {
		return null;
	}

	if ( ! fallbackValue.trim() ) {
		return `var(--${ name })`;
	}

	return `var(--${ name }, ${ fallbackValue })`;
} );
