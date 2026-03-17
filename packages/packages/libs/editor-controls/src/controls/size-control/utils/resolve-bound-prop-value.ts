import { sizePropTypeUtil, type SizePropValue } from '@elementor/editor-props';

import { hasSizeValue } from './has-size-value';
import { EXTENDED_UNITS } from './resolve-size-value';

type SizeValue = SizePropValue[ 'value' ] | null;

export type ResolvedBoundProp = {
	sizeValue: SizeValue;
	isUnitHighlighted: boolean;
	placeholder: string | undefined;
};

export const resolveBoundPropValue = < T extends SizeValue >(
	value?: T | null,
	boundPropPlaceholder?: T | null,
	propPlaceholder?: string
): ResolvedBoundProp => {
	let sizeValue: T | null = null;

	if ( validateSizeValue( value ) ) {
		sizeValue = value;
	} else if ( validateSizeValue( boundPropPlaceholder ) ) {
		sizeValue = { size: '', unit: boundPropPlaceholder?.unit } as T;
	}

	return {
		sizeValue,
		isUnitHighlighted: shouldHighlightUnit( value ),
		placeholder: resolvePlaceholder( propPlaceholder, boundPropPlaceholder ),
	};
};

const validateSizeValue = ( value?: SizeValue | null ): value is SizeValue => {
	if ( ! value ) {
		return false;
	}

	const sizePropValue = sizePropTypeUtil.create( value );

	return sizePropTypeUtil.isValid( sizePropValue );
};

const resolvePlaceholder = ( propPlaceholder?: string, boundPropPlaceholder?: SizeValue ): string | undefined => {
	if ( propPlaceholder ) {
		return propPlaceholder;
	}

	const size = boundPropPlaceholder?.size;

	if ( size === undefined ) {
		return undefined;
	}

	if ( typeof size === 'number' ) {
		return size.toString();
	}

	return size;
};

const shouldHighlightUnit = ( value?: SizePropValue[ 'value' ] | null ) => {
	if ( ! value ) {
		return false;
	}

	if ( value.unit === EXTENDED_UNITS.auto ) {
		return true;
	}

	return hasSizeValue( value.size );
};
