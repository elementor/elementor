import { type PropTypeKey } from '@elementor/editor-props';

import { type AnyTransformer, type TransformersMap } from './types';

export type TransformersRegistry = ReturnType< typeof createTransformersRegistry >;

export function createTransformersRegistry() {
	const transformers: TransformersMap = {};

	let fallbackTransformer: AnyTransformer | null = null;

	return {
		register( type: PropTypeKey, transformer: AnyTransformer ) {
			transformers[ type ] = transformer;

			return this;
		},
		registerFallback( transformer: AnyTransformer ) {
			fallbackTransformer = transformer;

			return this;
		},
		get( type: PropTypeKey ): AnyTransformer | null {
			return transformers[ type ] ?? fallbackTransformer;
		},
		all() {
			return { ...transformers };
		},
	};
}
