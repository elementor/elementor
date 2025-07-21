import { z, type ZodType } from '@elementor/schema';

import { type PropValue, type TransformablePropValue } from '../types';

type Updater< T > = ( prev?: T ) => T;

export type CreateOptions = {
	base?: unknown;
	disabled?: boolean;
	overrideKey?: string;
};

export type PropTypeUtil< TKey extends string, TValue extends PropValue > = ReturnType<
	typeof createPropUtils< TKey, TValue >
>;

/**
 * Usage example:
 *
 * ```ts
 * const elementsPropUtils = createPropUtils( 'elements', z.array( z.string() ) );
 *
 * elementsPropUtils.isValid( element.props?.children );
 * elementsPropUtils.create( [ 'a', 'b' ] );
 * elementsPropUtils.create( ( prev = [] ) => [ ...prev, 'c' ], { base: element.props?.children } );
 * elementsPropUtils.create( ( prev = [] ) => [ ...prev, 'c' ], { disabled: true } );
 * elementsPropUtils.extract( element.props?.children );
 *
 * ```
 */

export function createPropUtils< TKey extends string, TValue extends PropValue >(
	key: TKey,
	valueSchema: ZodType< TValue >
) {
	const schema = z.strictObject( {
		$$type: z.literal( key ),
		value: valueSchema,
		disabled: z.boolean().optional(),
	} );

	type Prop = TransformablePropValue< TKey, TValue >;

	function isValid( prop: unknown ): prop is Prop {
		return schema.safeParse( prop ).success;
	}

	function create( value: TValue ): Prop;
	function create( value: TValue, createOptions?: CreateOptions ): Prop;
	function create( value: Updater< TValue >, createOptions: CreateOptions ): Prop;
	function create( value: TValue | Updater< TValue >, createOptions?: CreateOptions ): Prop {
		const fn = ( typeof value === 'function' ? value : () => value ) as Updater< TValue >;

		const { base, disabled } = createOptions || {};

		if ( ! base ) {
			return {
				$$type: ( createOptions?.overrideKey as TKey ) || key,
				value: fn(),
				...( disabled && { disabled } ),
			};
		}

		if ( ! isValid( base ) ) {
			throw new Error( `Cannot create prop based on invalid value: ${ JSON.stringify( base ) }` );
		}

		return {
			$$type: ( createOptions?.overrideKey as TKey ) || key,
			value: fn( base.value ),
			...( disabled && { disabled } ),
		};
	}

	function extract( prop: unknown ): TValue | null {
		if ( ! isValid( prop ) ) {
			return null;
		}

		return prop.value;
	}

	return {
		extract,
		isValid,
		create,
		schema,
		key: key as TKey,
	};
}

export function createArrayPropUtils< TKey extends string, TValue extends PropValue >(
	key: TKey,
	valueSchema: ZodType< TValue >,
	overrideKey?: string
) {
	return createPropUtils( overrideKey || `${ key }-array`, z.array( valueSchema ) );
}
