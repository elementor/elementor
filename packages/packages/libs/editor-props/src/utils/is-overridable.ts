import { type TransformablePropValue } from '../types';
import { isTransformable } from './is-transformable';

type OverridableInner = {
	override_key: string;
	origin_value: TransformablePropValue< string >;
};

export type OverridableTransformable = TransformablePropValue< 'overridable', OverridableInner >;

export function isOverridable( value: unknown ): value is OverridableTransformable {
	return isTransformable( value ) && value.$$type === 'overridable';
}

export function rewrapOverridableValue(
	existing: OverridableTransformable,
	newInner: TransformablePropValue< string >
): OverridableTransformable {
	return {
		...existing,
		value: {
			...existing.value,
			origin_value: newInner,
		},
	};
}
