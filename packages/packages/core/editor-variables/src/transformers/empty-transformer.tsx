import { createTransformer } from '@elementor/editor-canvas';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const EmptyTransformer = createTransformer( ( _value: string ) => {
	return null;
} );
