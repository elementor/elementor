import * as React from 'react';
import { useCallback, useRef } from 'react';
import { type Unit, UnstableSizeField } from '@elementor/editor-controls';
import { type SizePropValue } from '@elementor/editor-props';

import { DEFAULT_TIME_UNIT, TIME_UNITS } from '../../configs/time-constants';
import { type FieldProps, type SizeStringValue } from '../../types';
import { formatSizeValue, parseSizeValue } from '../../utils/size-transform-utils';
import { convertTimeUnit } from '../../utils/time-conversion';

export function TimeFrameIndicator( {
	value,
	onChange,
	defaultValue,
}: FieldProps & { defaultValue: SizeStringValue } ) {
	const sizeValue = parseSizeValue( value as SizeStringValue, TIME_UNITS, defaultValue, DEFAULT_TIME_UNIT );
	const prevUnitRef = useRef< Unit >( sizeValue.unit as Unit );

	const setValue = useCallback(
		( size: SizePropValue[ 'value' ] ) => {
			const unitChanged = prevUnitRef.current !== size.unit;

			if ( unitChanged ) {
				const fromUnit = prevUnitRef.current;
				const toUnit = size.unit as Unit;

				size.size = convertTimeUnit( Number( size.size ), fromUnit, toUnit );
				prevUnitRef.current = toUnit;
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
			setValue( parseSizeValue( defaultValue, TIME_UNITS, undefined, DEFAULT_TIME_UNIT ) );
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
