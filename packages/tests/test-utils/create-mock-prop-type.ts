import {
	type ArrayPropType,
	type ObjectPropType,
	type PlainPropType,
	type PropType,
	type UnionPropType,
} from '@elementor/editor-props';

type ReturnValue< T extends Partial< PropType > > = T[ 'kind' ] extends 'array'
	? ArrayPropType
	: T[ 'kind' ] extends 'object'
	? ObjectPropType
	: T[ 'kind' ] extends 'union'
	? UnionPropType
	: T[ 'kind' ] extends 'plain'
	? PlainPropType
	: never;

export function createMockPropType< T extends Partial< PropType > >(
	options: Partial< PropType > = { kind: 'plain' }
): ReturnValue< T > {
	const base = {
		default: options.default || null,
		settings: options.settings || {},
		meta: options.meta || {},
		dependencies: options.dependencies || null,
	};

	if ( options.kind === 'array' ) {
		return {
			...base,
			key: options.key || 'test',
			kind: 'array',
			item_prop_type: options.item_prop_type as PropType,
		} as ReturnValue< T >;
	}

	if ( options.kind === 'object' ) {
		return {
			...base,
			key: options.key || 'test',
			kind: 'object',
			shape: options.shape || {},
		} as ReturnValue< T >;
	}

	if ( options.kind === 'union' ) {
		return {
			...base,
			kind: 'union',
			prop_types: options.prop_types || {},
		} as ReturnValue< T >;
	}

	if ( options.kind === 'plain' ) {
		return {
			...base,
			kind: 'plain',
			key: options.key || 'test',
		} as ReturnValue< T >;
	}

	return {} as never;
}
