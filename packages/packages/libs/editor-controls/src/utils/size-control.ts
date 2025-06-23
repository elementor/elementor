export const defaultUnits = [ 'px', '%', 'em', 'rem', 'vw', 'vh' ] as const;
const defaultExtendedOptions = [ 'auto', 'custom' ] as const;

export type Unit = ( typeof defaultUnits )[ number ];

export type ExtendedOption = ( typeof defaultExtendedOptions )[ number ];

export function isUnitExtendedOption( unit: Unit | ExtendedOption ): unit is ExtendedOption {
	return defaultExtendedOptions.includes( unit as ExtendedOption );
}
