import * as React from 'react';
import { useCallback } from 'react';
import { UnstableSizeField } from '@elementor/editor-controls';
import { sizePropTypeUtil, type SizePropValue } from '@elementor/editor-props';

import { type FieldProps } from '../../types';

const DEFAULT_UNIT = 'ms';

export function TimeFrameIndicator( { value, onChange, defaultValue }: FieldProps & { defaultValue: number } ) {
	const sizeValue = toSizeValue( value ?? defaultValue );

	const setValue = useCallback(
		( size: number ) => {
			onChange( String( size ) );
		},
		[ onChange ]
	);

	const handleChange = ( newValue: SizePropValue[ 'value' ] ) => {
		setValue( newValue.size as number );
	};

	const handleBlur = () => {
		if ( ! sizeValue.size ) {
			setValue( defaultValue );
		}
	};

	return (
		<UnstableSizeField
			units={ [ DEFAULT_UNIT ] }
			value={ sizeValue }
			onChange={ handleChange }
			onBlur={ handleBlur }
		/>
	);
}

const toSizeValue = ( value: string ): SizePropValue[ 'value' ] => {
	return sizePropTypeUtil.create( {
		size: Number( value ),
		unit: DEFAULT_UNIT,
	} ).value;
};
