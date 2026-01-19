import * as React from 'react';
import { Unit } from '@elementor/editor-controls';
import type { PropValue, SizePropValue } from '@elementor/editor-props';
import { InputAdornment } from '@elementor/ui';
import { UnitSelect } from './unit-select'
import { useSizeValue } from '../../hooks/use-size-value';
import { UnstableSizeInput } from './unstable-size-input';

type Props<TValue = SizePropValue['value']> = {
	units: Unit[];
	value: TValue;
	onChange: ( value: TValue ) => void;
};

export const UnstableSizeField = (
	{
		value,
		onChange,
		units,
	}:
	Props
) => {
	const { size, unit, setSize, setUnit } = useSizeValue( value, onChange );

	const shouldHighlightUnit = () => {
		return hasValue( size );
	};

	return (
		<UnstableSizeInput
			type="number"
			value={ size ?? '' }
			onChange={ ( event ) => setSize( event.target.value ) }
			InputProps={ {
				endAdornment: (
					<InputAdornment position="end">
						<UnitSelect
							options={ units }
							value={ unit }
							onClick={ setUnit }
							showPrimaryColor={ shouldHighlightUnit() }
						/>
					</InputAdornment>
				)
			} }
		/>
	);
}

const hasValue = ( value: PropValue ): boolean => {
	return value != null && value !== '';
}
