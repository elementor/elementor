import { type AnyTransformer, createTransformer } from '@elementor/editor-canvas';

export const createRepeaterToItemsTransformer = ( originalTransformer: AnyTransformer ) => {
	return createTransformer( ( value: string, options: { key: string; signal?: AbortSignal } ) => {
		const stringResult = originalTransformer( value, options );

		if ( ! stringResult || typeof stringResult !== 'string' ) {
			return stringResult;
		}

		return stringResult;
	} );
};
