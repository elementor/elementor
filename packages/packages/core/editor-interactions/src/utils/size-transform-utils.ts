import { type SizePropValue } from '@elementor/editor-props';

import { type TimeUnit, type TimeValue } from '../types';

type SizeValue = SizePropValue[ 'value' ];
type SizeUnit = SizeValue[ 'unit' ];

const SIZE_REGEX = /^(?:(-?\d*\.?\d+)([a-z%]+)|([a-z%]+))$/i;

export const parseSizeValue = (
	value: TimeValue,
	allowedUnits: SizeUnit[],
	defaultValue?: TimeValue,
	defaultUnit?: TimeUnit
): SizeValue => {
	if ( typeof value === 'number' ) {
		return {
			size: value,
			unit: defaultUnit as TimeUnit,
		};
	}

	const sizeValue = tryParse( value, allowedUnits, defaultUnit );

	if ( sizeValue ) {
		return sizeValue;
	}

	if ( defaultValue ) {
		const fallbackSize = tryParse( defaultValue, allowedUnits, defaultUnit );

		if ( fallbackSize ) {
			return fallbackSize;
		}
	}

	return createSizeValue( null, defaultUnit );
};

const tryParse = ( value: TimeValue, allowedUnits: SizeUnit[], defaultUnit?: TimeUnit ): SizeValue | null => {
	if ( typeof value === 'number' ) {
		return createSizeValue( value, defaultUnit );
	}

	const match = value && value.match( SIZE_REGEX );

	if ( ! match ) {
		return null;
	}

	const size = match[ 1 ] ? parseFloat( match[ 1 ] ) : null;
	const unit = ( match[ 2 ] || match[ 3 ] ) as SizeUnit;

	if ( ! allowedUnits.includes( unit ) ) {
		return null;
	}

	return createSizeValue( size, unit );
};

export const formatSizeValue = ( { size, unit }: SizeValue ): TimeValue => {
	return `${ size ?? '' }${ unit }` as TimeValue;
};

const createSizeValue = ( size: number | null, unit?: SizeUnit ): SizeValue => {
	return { size, unit } as SizeValue;
};
