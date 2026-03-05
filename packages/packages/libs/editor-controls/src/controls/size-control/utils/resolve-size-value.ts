import { type SizePropValue } from '@elementor/editor-props';

import { type SizeUnit } from '../types';

type SizeValue = SizePropValue[ 'value' ];

type ResolverContext< U > = {
	units: U[];
	defaultUnit?: U;
};

export const DEFAULT_SIZE_UNIT = 'px';

export const DEFAULT_SIZE = '';

export const EXTENDED_UNITS = {
	auto: 'auto',
	custom: 'custom',
} as const;

export const resolveSizeValue = < TValue extends SizeValue | null, TUnit extends SizeValue[ 'unit' ] >(
	value: TValue,
	context: ResolverContext< TUnit >
) => {
	if ( ! value ) {
		return value;
	}

	const { units, defaultUnit } = context;

	const unit = resolveFallbackUnit( value.unit as TUnit, units, defaultUnit );

	if ( unit === EXTENDED_UNITS.auto ) {
		return { size: DEFAULT_SIZE, unit };
	}

	if ( unit === EXTENDED_UNITS.custom ) {
		return { size: String( value.size ?? DEFAULT_SIZE ), unit };
	}

	return {
		size: sanitizeSize( value.size ) ?? DEFAULT_SIZE,
		unit,
	};
};

const resolveFallbackUnit = < TUnit extends SizeUnit >(
	unit: TUnit,
	units: readonly TUnit[],
	defaultUnit?: TUnit
): TUnit | string => {
	if ( units.includes( unit ) ) {
		return unit;
	}

	if ( defaultUnit && units.includes( defaultUnit ) ) {
		return defaultUnit;
	}

	if ( units.includes( DEFAULT_SIZE_UNIT as TUnit ) ) {
		return DEFAULT_SIZE_UNIT;
	}

	return units[ 0 ] ?? '';
};

const sanitizeSize = ( size: SizeValue[ 'size' ] ): SizeValue[ 'size' ] => {
	if ( typeof size === 'number' && isNaN( size ) ) {
		return DEFAULT_SIZE;
	}
	return size;
};
