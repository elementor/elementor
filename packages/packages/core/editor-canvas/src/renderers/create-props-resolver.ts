import {
	isTransformable,
	type PropKey,
	type Props,
	type PropsSchema,
	type PropType,
	type PropValue,
} from '@elementor/editor-props';

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
};

type TransformArgs = {
	value: unknown;
	key: PropKey;
	type: PropType;
	signal?: AbortSignal;
	depth?: number;
};

type ResolvedProps = Record< string, unknown >;

export type PropsResolver = ReturnType< typeof createPropsResolver >;

const TRANSFORM_DEPTH_LIMIT = 3;

export function createPropsResolver( { transformers, schema: initialSchema, onPropResolve }: CreatePropResolverArgs ) {
	async function resolve( { props, schema, signal }: ResolveArgs ): Promise< ResolvedProps > {
		schema = schema ?? initialSchema;

		const promises = Promise.all(
			Object.entries( schema ).map( async ( [ key, type ] ) => {
				const value = props[ key ] ?? type.default;

				const transformed = await transform( { value, key, type, signal } );

				onPropResolve?.( { key, value: transformed } );

				if ( isMultiProps( transformed ) ) {
					return getMultiPropsValue( transformed );
				}

				return { [ key ]: transformed };
			} )
		);

		return Object.assign( {}, ...( await promises ).filter( Boolean ) );
	}

	async function transform( { value, key, type, signal, depth = 0 }: TransformArgs ) {
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

		if ( type.kind === 'union' ) {
			type = type.prop_types[ value.$$type ];

			if ( ! type ) {
				return null;
			}
		}

		if ( value.$$type !== type.key ) {
			return null;
		}

		// Warning: This variable is loosely-typed - use with caution.
		let resolvedValue = value.value;

		if ( type.kind === 'object' ) {
			resolvedValue = await resolve( {
				props: resolvedValue,
				schema: type.shape,
				signal,
			} );
		}

		if ( type.kind === 'array' ) {
			resolvedValue = await Promise.all(
				resolvedValue.map( ( item: PropValue ) =>
					transform( { value: item, key, type: type.item_prop_type, depth, signal } )
				)
			);
		}

		const transformer = transformers.get( value.$$type );

		if ( ! transformer ) {
			return null;
		}

		try {
			const transformed = await transformer( resolvedValue, { key, signal } );

			return transform( { value: transformed, key, type, signal, depth: depth + 1 } );
		} catch {
			return null;
		}
	}

	return resolve;
}
