import { type SizePropValue } from '@elementor/editor-props';

import { type TimeUnit } from '../types';

type SizeValue = SizePropValue[ 'value' ];
type SizeUnit = SizeValue[ 'unit' ];

const SIZE_REGEX = /^(?:(-?\d*\.?\d+)([a-z%]+)|([a-z%]+))$/i;

export const parseSizeValue = (
	value: string,
	allowedUnits: SizeUnit[],
	defaultValue?: string,
	defaultUnit?: TimeUnit
): SizeValue => {
	const sizeValue = tryParse( value, allowedUnits );

	if ( sizeValue ) {
		return sizeValue;
	}

	if ( defaultValue ) {
		const fallbackSize = tryParse( defaultValue, allowedUnits );

		if ( fallbackSize ) {
			return fallbackSize;
		}
	}

	return createSizeValue( null, defaultUnit );
};

const tryParse = ( value: string, allowedUnits: SizeUnit[] ): SizeValue | null => {
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

export const formatSizeValue = ( { size, unit }: SizeValue ): string | null => {
	return `${ size ?? '' }${ unit }`;
};

const createSizeValue = ( size: number | null, unit?: SizeUnit ): SizeValue => {
	return { size, unit } as SizeValue;
};
