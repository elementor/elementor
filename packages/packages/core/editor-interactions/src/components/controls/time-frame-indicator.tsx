import * as React from 'react';
import { ControlFormLabel, PopoverGridContainer, UnstableSizeField } from '@elementor/editor-controls';
import { Grid } from '@elementor/ui';

import { NumberPropValue } from '../../types';
import { numberPropTypeUtil, PropValue, sizePropTypeUtil, SizePropValue } from '@elementor/editor-props';
import { createNumber } from '../../utils/prop-value-utils';
import { useId, useMemo } from 'react';

const DEFAULT_UNIT = 'ms';

type Props<T = NumberPropValue> = {
	value: T
	onChange: ( value: T ) => void;
	defaultValue: number;
	label: string;
};

export function TimeFrameIndicator( {
	value: numberValue,
	onChange,
	label,
	defaultValue,
}: Props ) {
	const sizeValue = useMemo( () => convertToSizeValue( numberValue ), [ numberValue ] );
	const id = useId();

	const convertToNumberPropValue = ( value: SizePropValue['value'] ) => {
		const numberValue = createNumber( value.size as number );

		onChange( numberValue ?? defaultValue );
	};

	return (
		<Grid item xs={ 12 }>
			<PopoverGridContainer>
				<Grid item xs={ 6 }>
					<ControlFormLabel>{ label }</ControlFormLabel>
				</Grid>
				<Grid item xs={ 6 }>
					<UnstableSizeField
						units={ [ DEFAULT_UNIT ] }
						value={ sizeValue }
						onChange={ convertToNumberPropValue }
						id={ id }
					/>
				</Grid>
			</PopoverGridContainer>
		</Grid>
	);
}

const convertToSizeValue = ( value: PropValue ): SizePropValue['value'] => {
	if ( ! numberPropTypeUtil.isValid( value ) ) {
		return {
			size: 0,
			unit: DEFAULT_UNIT,
		}
	}

	return sizePropTypeUtil.create( {
		size: value.value as number,
		unit: DEFAULT_UNIT,
	} ).value;
}
