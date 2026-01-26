import * as React from 'react';
import { useCallback, useRef, useState } from 'react';
import { type Unit, UnstableSizeField } from '@elementor/editor-controls';
import { sizePropTypeUtil, type SizePropValue } from '@elementor/editor-props';

import { type FieldProps } from '../../types';

type TimeUnit = Extract< Unit, 'ms' | 's' >;

const UNIT_TO_MS: Record< TimeUnit, number > = {
	ms: 1,
	s: 1000,
};

const DEFAULT_UNIT: TimeUnit = 'ms';
const SUPPORTED_UNITS: TimeUnit[] = [ 'ms', 's' ];

export function TimeFrameIndicator( { value, onChange, defaultValue }: FieldProps & { defaultValue: number } ) {
	const [ activeUnit, setActiveUnit ] = useState< TimeUnit >( DEFAULT_UNIT );

	const milliseconds = Number( value ?? defaultValue );
	const displayValue = convertTime( milliseconds, 'ms', activeUnit );

	const sizeValue = toSizeValue( displayValue, activeUnit );
	const lastDisplayValueRef = useRef< number >( displayValue );

	const setValue = useCallback(
		( size: number ) => {
			onChange( String( size ) );
		},
		[ onChange ]
	);

	const handleChange = ( newValue: SizePropValue[ 'value' ] ) => {
		const newUnit = newValue.unit as TimeUnit;
		const newSize = newValue.size as number;

		const isUnitSwitchOnly = newSize === lastDisplayValueRef.current && newUnit !== activeUnit;

		setActiveUnit( newUnit );

		if ( isUnitSwitchOnly ) {
			lastDisplayValueRef.current = convertTime( milliseconds, 'ms', newUnit );
			return;
		}

		lastDisplayValueRef.current = newSize;
		setValue( convertTime( newSize, newUnit, 'ms' ) );
	};

	const handleBlur = () => {
		if ( ! sizeValue.size ) {
			setValue( defaultValue );
		}
	};

	return (
		<UnstableSizeField
			units={ SUPPORTED_UNITS }
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

const toSizeValue = ( displaySize: number, unit: TimeUnit ): SizePropValue[ 'value' ] => {
	return sizePropTypeUtil.create( {
		size: displaySize,
		unit,
	} ).value;
};
