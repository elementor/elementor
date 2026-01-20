import * as React from 'react';
import { useCallback } from 'react';
import { UnstableSizeField } from '@elementor/editor-controls';
import { sizePropTypeUtil, type SizePropValue } from '@elementor/editor-props';

import { type NumberPropValue } from '../../types';
import { createNumber } from '../../utils/prop-value-utils';

type Props< T = NumberPropValue > = {
	value: T;
	onChange: ( value: T ) => void;
	defaultValue: number;
};

const DEFAULT_UNIT = 'ms';

export function TimeFrameIndicator( { value, onChange, defaultValue }: Props ) {
	const sizeValue = toSizeValue( value, defaultValue );

	const setValue = useCallback(
		( size: number ) => {
			onChange( createNumber( size ) );
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
			defaultValue={ { size: 90 } }
		/>
	);
}

const toSizeValue = ( value: NumberPropValue, defaultValue: number ): SizePropValue[ 'value' ] => {
	if ( value.$$type !== 'number' ) {
		return {
			size: defaultValue,
			unit: DEFAULT_UNIT,
		};
	}

	return sizePropTypeUtil.create( {
		size: value.value as number,
		unit: DEFAULT_UNIT,
	} ).value;
};
