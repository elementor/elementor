import { type SizePropValue } from '@elementor/editor-props';

import { DEFAULT_SIZE, DEFAULT_UNIT, type ExtendedOption, isUnitExtendedOption, type Unit } from './size-control';

type SizeValue = SizePropValue[ 'value' ];

export type State = {
	numeric: number;
	custom: string;
	unit: Unit | ExtendedOption;
};

export function formatSize< TSize extends string | number >( size: TSize, unit: Unit | ExtendedOption ): TSize {
	if ( isUnitExtendedOption( unit ) ) {
		return unit === 'auto' ? ( '' as TSize ) : ( String( size ?? '' ) as TSize );
	}

	return size || size === 0 ? ( Number( size ) as TSize ) : ( NaN as TSize );
}

export function createStateFromSizeProp(
	sizeValue: SizeValue | null,
	defaultUnit: Unit | ExtendedOption,
	defaultSize: string | number = '',
	customState: string = ''
): State {
	const unit = sizeValue?.unit ?? defaultUnit;
	const size = sizeValue?.size ?? defaultSize;

	return {
		numeric:
			! isUnitExtendedOption( unit ) && ! isNaN( Number( size ) ) && ( size || size === 0 )
				? Number( size )
				: DEFAULT_SIZE,
		custom: unit === 'custom' ? String( size ) : customState,
		unit,
	};
}

export function extractValueFromState( state: State | null, allowEmpty: boolean = false ): SizeValue | null {
	if ( ! state ) {
		return null;
	}

	if ( ! state?.unit ) {
		return { size: DEFAULT_SIZE, unit: DEFAULT_UNIT };
	}

	const { unit } = state;

	if ( unit === 'auto' ) {
		return { size: '', unit };
	}

	if ( unit === 'custom' ) {
		return { size: state.custom ?? '', unit: 'custom' };
	}

	const numeric = state.numeric;

	// For invalid/empty numeric values, return null for external persistence
	// but allow the display layer (allowEmpty=true) to show the unit
	if ( ! allowEmpty && ( numeric === undefined || numeric === null || Number.isNaN( numeric ) ) ) {
		return null;
	}

	return {
		size: numeric,
		unit,
	};
}
