export const lengthUnits = [ 'px', '%', 'em', 'rem', 'vw', 'vh' ] as const;
export const angleUnits = [ 'deg', 'rad', 'grad', 'turn' ] as const;
export const timeUnits = [ 's', 'ms' ] as const;
const defaultExtendedOptions = [ 'auto', 'custom' ] as const;

export const DEFAULT_UNIT = 'px';
export const DEFAULT_SIZE = NaN;

export type LengthUnit = ( typeof lengthUnits )[ number ];
export type AngleUnit = ( typeof angleUnits )[ number ];
export type TimeUnit = ( typeof timeUnits )[ number ];
export type ExtendedOption = ( typeof defaultExtendedOptions )[ number ];

export type Unit = LengthUnit | AngleUnit | TimeUnit;

export function isUnitExtendedOption( unit: Unit | ExtendedOption ): unit is ExtendedOption {
	return defaultExtendedOptions.includes( unit as ExtendedOption );
}
