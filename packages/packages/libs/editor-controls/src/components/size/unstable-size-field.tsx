import * as React from 'react';
import type { PropValue, SizePropValue } from '@elementor/editor-props';
import { InputAdornment, type TextFieldProps } from '@elementor/ui';

import { useSizeValue } from '../../hooks/use-size-value';
import { type Unit } from '../../utils/size-control';
import { UnitSelect } from './unit-select';
import { UnstableSizeInput } from './unstable-size-input';

type Props< TValue > = {
	value: TValue;
	units: Unit[];
	defaultUnit?: Unit;
	onChange: ( value: TValue ) => void;
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	disabled?: boolean;
	InputProps?: TextFieldProps[ 'InputProps' ];
	startIcon?: React.ReactNode;
};

export const UnstableSizeField = < T extends SizePropValue[ 'value' ] >( {
	value,
	InputProps,
	onChange,
	onBlur,
	units,
	defaultUnit,
	startIcon,
}: Props< T > ) => {
	const { size, unit, setSize, setUnit } = useSizeValue< T >( value, onChange, defaultUnit );

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
				...InputProps,
				startAdornment: startIcon && <InputAdornment position="start">{ startIcon }</InputAdornment>,
				endAdornment: (
					<InputAdornment position="end">
						<UnitSelect
							options={ units }
							value={ unit }
							onClick={ setUnit }
							showPrimaryColor={ shouldHighlightUnit() }
						/>
					</InputAdornment>
				),
			} }
		/>
	);
};

const hasValue = ( value: PropValue ): boolean => {
	return value !== null && value !== '';
};
