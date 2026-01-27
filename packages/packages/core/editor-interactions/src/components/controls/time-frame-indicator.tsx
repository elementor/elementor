import * as React from 'react';
import { useCallback, useRef } from 'react';
import { UnstableSizeField } from '@elementor/editor-controls';
import { type SizePropValue } from '@elementor/editor-props';

import { TIME_UNITS } from '../../configs/time-constants';
import { type FieldProps, type TimeUnit } from '../../types';
import { formatSizeValue, parseSizeValue } from '../../utils/size-transform-utils';

const UNIT_TO_MS: Record< TimeUnit, number > = {
	ms: 1,
	s: 1000,
};

export function TimeFrameIndicator( { value, onChange, defaultValue }: FieldProps & { defaultValue: string } ) {
	const sizeValue = parseSizeValue( value, TIME_UNITS, defaultValue );
	const prevUnitRef = useRef< TimeUnit >( sizeValue.unit as TimeUnit );

	const setValue = useCallback(
		( size: SizePropValue[ 'value' ] ) => {
			const unitChanged = prevUnitRef.current !== size.unit;

			if ( unitChanged ) {
				const fromUnit = prevUnitRef.current;
				const toUnit = size.unit as TimeUnit;

				size.size = convertTime( Number( size.size ), fromUnit, toUnit );
			}

			onChange( formatSizeValue( size ) as string );
		},
		[ onChange ]
	);

	const handleChange = ( newValue: SizePropValue[ 'value' ] ) => {
		setValue( newValue );
	};

	const handleBlur = () => {
		if ( ! sizeValue.size ) {
			setValue( parseSizeValue( defaultValue, TIME_UNITS ) );
		}
	};

	return (
		<UnstableSizeField
			units={ TIME_UNITS }
			value={ sizeValue }
			onChange={ handleChange }
			onBlur={ handleBlur }
			InputProps={ {
				inputProps: {
					min: 0,
				},
			} }
		/>
	);
}

const convertTime = ( value: number, from: TimeUnit, to: TimeUnit ): number => {
	return ( value * UNIT_TO_MS[ from ] ) / UNIT_TO_MS[ to ];
};
