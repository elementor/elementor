import { type SizePropValue } from '@elementor/editor-props';

import { EXTENDED_UNITS } from './resolve-size-value';

type SizeValue = SizePropValue[ 'value' ] | null;

const conditions: Array< ( value: SizeValue ) => boolean > = [
	( value ) => ! value?.size,
	( value ) => value?.unit !== EXTENDED_UNITS.auto,
	( value ) => value?.unit !== EXTENDED_UNITS.custom,
];

export const shouldNullifyValue = ( value: SizeValue ): boolean => {
	return conditions.every( ( condition ) => condition( value ) );
};
