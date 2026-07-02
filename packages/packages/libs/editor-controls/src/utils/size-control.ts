import type { SizePropValue } from '@elementor/editor-props';

export type SizeUnit = SizePropValue[ 'value' ][ 'unit' ];

export type ExtendedOption = Extract< SizeUnit, 'auto' | 'custom' >;
export type Unit = Exclude< SizeUnit, ExtendedOption >;

export const lengthUnits = [ 'px', '%', 'em', 'rem', 'vw', 'vh', 'ch' ] as const satisfies readonly Unit[];
export const angleUnits = [ 'deg', 'rad', 'grad', 'turn' ] as const satisfies readonly Unit[];
export const timeUnits = [ 's', 'ms' ] as const satisfies readonly Unit[];

export const DEFAULT_UNIT = 'px' satisfies Unit;
export const DEFAULT_SIZE = NaN;

export type LengthUnit = Extract< Unit, ( typeof lengthUnits )[ number ] | 'fr' >;
export type AngleUnit = ( typeof angleUnits )[ number ];
export type TimeUnit = ( typeof timeUnits )[ number ];

const extendedOptions = [ 'auto', 'custom' ] as const satisfies readonly ExtendedOption[];

export function isUnitExtendedOption( unit: SizeUnit ): unit is ExtendedOption {
	return extendedOptions.includes( unit as ExtendedOption );
}
