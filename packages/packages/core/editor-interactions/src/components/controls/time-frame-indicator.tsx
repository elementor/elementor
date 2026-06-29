import * as React from 'react';
import { type FocusEvent, useCallback } from 'react';
import { SizeComponent } from '@elementor/editor-controls';
import { type SizePropValue } from '@elementor/editor-props';

import { DEFAULT_TIME_UNIT, TIME_UNITS } from '../../configs/time-constants';
import { type FieldProps, type SizeStringValue } from '../../types';
import { formatSizeValue, parseSizeValue } from '../../utils/size-transform-utils';

export function TimeFrameIndicator( {
	value,
	onChange,
	defaultValue,
}: FieldProps & { defaultValue: SizeStringValue } ) {
	const sizeValue = parseSizeValue( value as SizeStringValue, TIME_UNITS, defaultValue, DEFAULT_TIME_UNIT );

	const handleChange = useCallback(
		( size: SizePropValue[ 'value' ] ) => {
			onChange( formatSizeValue( size ) as string );
		},
		[ onChange ]
	);

	const handleBlur = ( event: FocusEvent< HTMLInputElement > ) => {
		if ( ! event.target.value ) {
			handleChange( parseSizeValue( defaultValue, TIME_UNITS, undefined, DEFAULT_TIME_UNIT ) );
		}
	};

	return (
		<SizeComponent
			units={ TIME_UNITS }
			value={ sizeValue }
			setValue={ handleChange }
			onBlur={ handleBlur }
			InputProps={ {
				inputProps: {
					min: 0,
				},
			} }
		/>
	);
}
