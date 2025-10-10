import { type AnyTransformable } from '@elementor/editor-props';

import { type Transformer, type UnbrandedTransformer } from './types';

// Wrap transformer for better DX (types).
// Inspired by: https://tkdodo.eu/blog/the-query-options-api
export function createTransformer< TValue = never >(
	cb: TValue extends AnyTransformable
		? 'Transformable values are invalid, use the actual value instead.'
		: UnbrandedTransformer< TValue >
): Transformer< NoInfer< TValue > > {
	return cb as never;
}
