import * as React from 'react';
import { PopoverGridContainer, UnstableSizeField } from '@elementor/editor-controls';
import { Grid } from '@elementor/ui';

import { NumberPropValue } from '../../types';
import { numberPropTypeUtil, PropValue, sizePropTypeUtil, SizePropValue } from '@elementor/editor-props';
import { createNumber } from '../../utils/prop-value-utils';

const DEFAULT_UNIT = 'ms';

type Props<T = NumberPropValue> = {
	value: T
	onChange: ( value: T ) => void;
	defaultValue: number;
};

export function TimeFrameIndicator( {
	value: numberValue,
	onChange,
	defaultValue,
}: Props ) {
	const sizeValue = convertToSize( numberValue, defaultValue );

	const convertToNumber = ( value: SizePropValue['value'] ) => {
		const numberValue = createNumber( value.size as number );

		onChange( numberValue ?? defaultValue );
	};

	return (
		<Grid item xs={ 12 }>
			<PopoverGridContainer>
				<Grid item xs={ 6 }>
					<UnstableSizeField
						units={ [ DEFAULT_UNIT ] }
						value={ sizeValue }
						onChange={ convertToNumber }
					/>
				</Grid>
			</PopoverGridContainer>
		</Grid>
	);
}

const convertToSize = ( value: PropValue, defaultValue: number ): SizePropValue['value'] => {
	if ( ! numberPropTypeUtil.isValid( value ) ) {
		return {
			size: defaultValue,
			unit: DEFAULT_UNIT,
		}
	}

	return sizePropTypeUtil.create( {
		size: value.value as number,
		unit: DEFAULT_UNIT,
	} ).value;
}
