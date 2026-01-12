import {
	isTransformable,
	migratePropValue,
	type PropKey,
	type Props,
	type PropsSchema,
	type PropType,
	type PropValue,
	type TransformablePropType,
} from '@elementor/editor-props';

import { type RenderContext } from '../legacy/types';
import { type TransformersRegistry } from '../transformers/create-transformers-registry';
import { getMultiPropsValue, isMultiProps } from './multi-props';

type CreatePropResolverArgs = {
	transformers: TransformersRegistry;
	schema: PropsSchema;
	onPropResolve?: ( args: { key: string; value: unknown } ) => void;
};

type ResolveArgs = {
	props: Props;
	schema?: PropsSchema;
	signal?: AbortSignal;
	renderContext?: RenderContext;
};

type TransformArgs = {
	value: unknown;
	key: PropKey;
	type: PropType;
	signal?: AbortSignal;
	depth?: number;
	renderContext?: RenderContext;
};

type ResolvedProps = Record< string, unknown >;

export type PropsResolver = ReturnType< typeof createPropsResolver >;

const TRANSFORM_DEPTH_LIMIT = 3;

export function createPropsResolver( { transformers, schema: initialSchema, onPropResolve }: CreatePropResolverArgs ) {
	async function resolve( { props, schema, signal, renderContext }: ResolveArgs ): Promise< ResolvedProps > {
		schema = schema ?? initialSchema;

		const promises = Promise.all(
			Object.entries( schema ).map( async ( [ key, type ] ) => {
				const value = props[ key ] ?? type.default;

				const transformed = ( await transform( { value, key, type, signal, renderContext } ) ) as PropValue;

				onPropResolve?.( { key, value: transformed } );

				if ( isMultiProps( transformed ) ) {
					return getMultiPropsValue( transformed );
				}

				return { [ key ]: transformed };
			} )
		);

		return Object.assign( {}, ...( await promises ).filter( Boolean ) );
	}

	async function transform( { value, key, type, signal, depth = 0, renderContext }: TransformArgs ) {
		if ( value === null || value === undefined ) {
			return null;
		}

		if ( ! isTransformable( value ) ) {
			return value;
		}

		if ( depth > TRANSFORM_DEPTH_LIMIT ) {
			return null;
		}

		if ( value.disabled === true ) {
			return null;
		}

		value = migratePropValue( value, type );

		if ( ! isTransformable( value ) ) {
			return value;
		}

		let transformablePropType = type;

		if ( type.kind === 'union' ) {
			transformablePropType = type.prop_types[ value.$$type ];

			if ( ! transformablePropType ) {
				return null;
			}
		}

		transformablePropType = transformablePropType as TransformablePropType;

		if ( value.$$type !== transformablePropType.key ) {
			return null;
		}

		// Warning: This variable is loosely-typed - use with caution.
		let resolvedValue = value.value;

		if ( transformablePropType.kind === 'object' ) {
			resolvedValue = await resolve( {
				props: resolvedValue,
				schema: transformablePropType.shape,
				signal,
				renderContext,
			} );
		}

		if ( transformablePropType.kind === 'array' ) {
			resolvedValue = await Promise.all(
				resolvedValue.map( ( item: PropValue ) =>
					transform( {
						value: item,
						key,
						type: transformablePropType.item_prop_type,
						depth,
						signal,
						renderContext,
					} )
				)
			);
		}

		const transformer = transformers.get( value.$$type );

		if ( ! transformer ) {
			return null;
		}

		try {
			const transformed = await transformer( resolvedValue, { key, signal, renderContext } );

			return transform( { value: transformed, key, type, signal, depth: depth + 1, renderContext } );
		} catch {
			return null;
		}
	}

	return resolve;
}
