export const defaultUnits = [ 'px', '%', 'em', 'rem', 'vw', 'vh' ] as const;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const degreeUnits = [ 'deg', 'rad', 'grad', 'turn' ] as const;
const defaultExtendedOptions = [ 'auto', 'custom' ] as const;

export const DEFAULT_UNIT = 'px';
export const DEFAULT_SIZE = NaN;

export type Unit = ( typeof defaultUnits )[ number ];
export type DegreeUnit = ( typeof degreeUnits )[ number ];
export type ExtendedOption = ( typeof defaultExtendedOptions )[ number ];

export function isUnitExtendedOption( unit?: Unit | DegreeUnit | ExtendedOption ): unit is ExtendedOption {
	return defaultExtendedOptions.includes( unit as ExtendedOption );
}
