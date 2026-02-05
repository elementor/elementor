import { type Unit } from '@elementor/editor-controls';
import { type SizePropValue } from '@elementor/editor-props';

import { type SizeStringValue } from '../types';

type SizeValue = SizePropValue[ 'value' ];
type SizeUnit = SizeValue[ 'unit' ];

const SIZE_REGEX = /^(?:(-?\d*\.?\d+)([a-z%]+)|([a-z%]+))$/i;

export const parseSizeValue = (
	value: SizeStringValue,
	allowedUnits: SizeUnit[],
	defaultValue?: SizeStringValue,
	defaultUnit?: Unit
): SizeValue => {
	if ( typeof value === 'number' ) {
		return {
			size: value,
			unit: defaultUnit as Unit,
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

const tryParse = ( value: SizeStringValue, allowedUnits: SizeUnit[], defaultUnit?: Unit ): SizeValue | null => {
	if ( typeof value === 'number' ) {
		return createSizeValue( value, defaultUnit );
	}

	const match = value && value.match( SIZE_REGEX );

	if ( ! match ) {
		if ( value ) {
			return {
				size: Number( value ),
				unit: defaultUnit as Unit,
			};
		}

		return null;
	}

	const size = match[ 1 ] ? parseFloat( match[ 1 ] ) : null;
	const unit = ( match[ 2 ] || match[ 3 ] ) as SizeUnit;

	if ( ! allowedUnits.includes( unit ) ) {
		return null;
	}

	return createSizeValue( size, unit );
};

export const formatSizeValue = ( { size, unit }: SizeValue ): SizeStringValue => {
	return `${ size ?? '' }${ unit }` as SizeStringValue;
};

const createSizeValue = ( size: number | null, unit?: SizeUnit ): SizeValue => {
	return { size, unit } as SizeValue;
};
