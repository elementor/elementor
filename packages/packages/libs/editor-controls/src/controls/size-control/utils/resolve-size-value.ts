import { type SizePropValue } from '@elementor/editor-props';

import { type SizeUnit } from '../types';
import { isExtendedUnit } from './is-extended-unit';

type SizeValue = SizePropValue[ 'value' ];

type ResolverContext< U > = {
	units: U[];
	defaultUnit?: U;
};

const DEFAULT_SIZE = '';

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

export const resolveSizeOnUnitChange = (
	size: SizeValue[ 'size' ],
	unit: SizeValue[ 'unit' ]
): SizeValue[ 'size' ] => {
	return isExtendedUnit( unit ) ? DEFAULT_SIZE : size;
};

export const createDefaultSizeValue = < T extends SizeValue >( units: SizeUnit[], defaultUnit?: SizeUnit ): T => {
	let [ unit ] = units;

	if ( defaultUnit !== undefined ) {
		unit = resolveFallbackUnit( defaultUnit, units );
	}

	return { size: DEFAULT_SIZE, unit } as T;
};

const resolveFallbackUnit = < TUnit extends SizeUnit >(
	unit: TUnit,
	units: readonly TUnit[],
	defaultUnit?: TUnit
): TUnit => {
	if ( units.includes( unit ) ) {
		return unit;
	}

	if ( defaultUnit && units.includes( defaultUnit ) ) {
		return defaultUnit;
	}

	return units[ 0 ] ?? '';
};

const sanitizeSize = ( size: SizeValue[ 'size' ] ): SizeValue[ 'size' ] => {
	if ( typeof size === 'number' && isNaN( size ) ) {
		return DEFAULT_SIZE;
	}

	return size;
};
