import { type SizePropValue } from '@elementor/editor-props';

import { hasSizeValue } from './has-size-value';
import { EXTENDED_UNITS } from './resolve-size-value';

type SizeValue = SizePropValue[ 'value' ] | null;

export type ResolvedBoundProp = {
	sizeValue: SizeValue;
	isUnitActive: boolean;
	placeholder: string | undefined;
};

export const resolveBoundPropValue = (
	value: SizeValue,
	boundPropPlaceholder?: SizeValue,
	propPlaceholder?: string
): ResolvedBoundProp => {
	const size = value?.size;
	const unit = value?.unit ?? boundPropPlaceholder?.unit;

	const hasValue = size || unit;

	return {
		sizeValue: ( hasValue ? { size, unit } : null ) as SizeValue,
		isUnitActive: shouldActivateUnit( value ),
		placeholder: resolvePlaceholder( propPlaceholder, boundPropPlaceholder ),
	};
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

const shouldActivateUnit = ( value: SizePropValue[ 'value' ] | null ) => {
	if ( ! value ) {
		return false;
	}

	if ( value.unit === EXTENDED_UNITS.auto ) {
		return true;
	}

	return hasSizeValue( value.size );
};

// // Todo wat if we dont both have unit & size we need to send null
// if ( ! value && ! placeholder ) {
// 	return null;
// }

// if ( value.unit === EXTENDED_UNITS.custom && hasSizeValue( value.size ) ) {
// 	return true;
// }
