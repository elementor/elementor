import * as React from 'react';
import { Unit } from '@elementor/editor-controls';
import type { PropValue, SizePropValue } from '@elementor/editor-props';
import { InputAdornment } from '@elementor/ui';
import { UnitSelect } from './unit-select'
import { useSizeValue } from '../../hooks/use-size-value';
import { UnstableSizeInput } from './unstable-size-input';

type Props<TValue> = {
	units: Unit[];
	value: TValue;
	defaultValue?: Partial<TValue>;
	onChange: ( value: TValue ) => void;
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
};

const DEFAULT_VALUE: SizePropValue['value'] = {
	unit: 'px',
	size: 0,
};

export const UnstableSizeField = <T extends SizePropValue['value']>(
	{
		value,
		defaultValue,
		onChange,
		onBlur,
		units,
	}:
	Props<T>
) => {
	const { size, unit, setSize, setUnit } = useSizeValue<T>( value, onChange, { ...DEFAULT_VALUE, ...defaultValue } as T );

	const shouldHighlightUnit = () => {
		return hasValue( size );
	};

	return (
		<UnstableSizeInput
			type="number"
			value={ size ?? '' }
			onBlur={ onBlur }
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
