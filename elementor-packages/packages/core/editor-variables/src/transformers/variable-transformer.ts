import { createTransformer } from '@elementor/editor-canvas';

export const variableTransformer = createTransformer( ( value: string ) => {
	if ( ! value.trim() ) {
		return null;
	}

	return `var(--${ value })`;
} );
