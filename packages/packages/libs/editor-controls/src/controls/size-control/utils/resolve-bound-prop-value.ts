import { type PropValue, sizePropTypeUtil, type SizePropValue } from '@elementor/editor-props';

type SizeValue = SizePropValue[ 'value' ];

type SizeValueResolver< T extends SizeValue > = {
	candidate: PropValue;
	resolve: ( v: T ) => T;
};

export const resolveBoundPropValue = < T extends SizeValue >(
	value?: T | null,
	boundPropPlaceholder?: T | null,
	propPlaceholder?: string | SizeValue
) => {
	const sizeValue = pickFirstValid< T >( [
		{ candidate: value, resolve: ( v ) => v },
		{ candidate: propPlaceholder, resolve: toUnitPlaceholder },
		{ candidate: boundPropPlaceholder, resolve: toUnitPlaceholder },
	] );

	const placeholderSource = propPlaceholder ?? boundPropPlaceholder;

	return {
		sizeValue,
		placeholder: resolvePlaceholder( placeholderSource ),
	};
};

const toUnitPlaceholder = < T extends SizeValue >( v: T ): T => ( { ...v, size: '' } );

const pickFirstValid = < T extends SizeValue >( candidates: SizeValueResolver< T >[] ): T | null => {
	const found = candidates.find( ( { candidate } ) => validateSizeValue( candidate ) );

	return found ? found.resolve( found.candidate as T ) : null;
};

const validateSizeValue = ( value: PropValue ): value is SizeValue => {
	if ( ! value || typeof value !== 'object' ) {
		return false;
	}

	const sizePropValue = sizePropTypeUtil.create( value as SizeValue );

	return sizePropTypeUtil.isValid( sizePropValue );
};

const resolvePlaceholder = ( placeholder?: string | null | SizeValue ): string | undefined => {
	if ( typeof placeholder === 'string' ) {
		return placeholder;
	}

	const size = placeholder?.size;

	if ( size === undefined ) {
		return undefined;
	}

	return typeof size === 'number' ? size.toString() : size;
};
