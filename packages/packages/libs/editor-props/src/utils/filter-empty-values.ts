import { type PropValue } from '../types';
import { isTransformable } from '../utils/is-transformable';

export const filterEmptyValues = < TValue extends PropValue >( value: TValue ): TValue | null => {
	if ( isEmpty( value ) ) {
		return null;
	}

	if ( Array.isArray( value ) ) {
		return value.map( filterEmptyValues ).filter( ( item ) => ! isEmpty( item ) ) as TValue;
	}

	if ( typeof value === 'object' ) {
		return Object.fromEntries(
			Object.entries( value )
				.map( ( [ key, val ] ) => [ key, filterEmptyValues( val ) ] )
				.filter( ( [ , val ] ) => ! isEmpty( val ) )
		);
	}

	return value;
};

type Nullish = null | undefined | '';

export const isEmpty = ( value: PropValue ): value is Nullish => {
	if ( value && isTransformable( value ) ) {
		return isEmpty( value.value );
	}

	return isNullish( value ) || isNullishArray( value ) || isNullishObject( value );
};

const isNullish = ( value: PropValue ): value is Nullish => value === null || value === undefined || value === '';

const isNullishArray = ( value: NonNullable< PropValue > ): value is Nullish[] =>
	Array.isArray( value ) && value.every( isEmpty );

const isNullishObject = ( value: NonNullable< PropValue > ): value is Record< string, Nullish > => {
	return typeof value === 'object' && isNullishArray( Object.values( value ) );
};
