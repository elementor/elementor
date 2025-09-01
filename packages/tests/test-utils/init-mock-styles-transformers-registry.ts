import { createTransformer, styleTransformersRegistry } from '@elementor/editor-canvas';
import { type DimensionsPropValue, type SizePropValue } from '@elementor/editor-props';

type MockTransformers = {
	[ key: string ]: ReturnType< typeof createTransformer >;
};

export function initMockStylesTransformersRegistry( transformers?: MockTransformers ) {
	const primitiveTransformers = Object.fromEntries(
		[ 'string', 'number', 'color' ].map( ( key ) => [
			key,
			createTransformer( ( value: unknown ) => String( value ) ),
		] )
	);

	const commonTransformers = {
		size: createTransformer( ( value: SizePropValue[ 'value' ] ) => `${ value.size }${ value.unit }` ),
		dimensions: createTransformer( ( dimensions: DimensionsPropValue[ 'value' ], context: { key: string } ) => {
			return {
				'$$multi-props': true,
				value: Object.fromEntries(
					Object.entries( dimensions ).map( ( [ key, value ] ) => [ `${ context.key }-${ key }`, value ] )
				),
			};
		} ),
	};

	const allTransformers = {
		...primitiveTransformers,
		...commonTransformers,
		...transformers,
	};

	Object.entries( allTransformers ).forEach( ( [ key, transformer ] ) => {
		styleTransformersRegistry.register( key, transformer );
	} );
}
