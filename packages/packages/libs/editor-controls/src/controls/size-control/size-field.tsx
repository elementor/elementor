import * as React from 'react';
import type { SizePropValue } from '@elementor/editor-props';
import { MathFunctionIcon } from '@elementor/icons';
import { InputAdornment, type TextFieldProps } from '@elementor/ui';

import { useSizeUnitKeyboard } from './hooks/use-size-unit-keyboard';
import { useSizeValue } from './hooks/use-size-value';
import { type SetSizeValue, type SizeUnit } from './types';
import { SizeInput } from './ui/size-input';
import { UnitSelector, type UnitSelectorProps } from './ui/unit-selector';
import { hasSizeValue } from './utils/has-size-value';
import { isExtendedUnit } from './utils/is-extended-unit';

export type SizeFieldProps< TValue extends SizePropValue[ 'value' ], TUnit extends SizeUnit > = {
	units: TUnit[];
	value: TValue | null;
	placeholder?: string;
	defaultUnit?: SizeUnit;
	startIcon?: React.ReactNode;
	setValue: SetSizeValue< TValue >;
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onKeyDown?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	onUnitChange?: ( unit: SizeUnit ) => void;
	disabled?: boolean;
	focused?: boolean;
	ariaLabel?: string;
	min?: number;
	InputProps?: TextFieldProps[ 'InputProps' ];
	unitSelectorProps?: Partial< UnitSelectorProps< TUnit > >;
};

const UNIT_DISPLAY_LABELS_OVERRIDES: Partial< Record< SizeUnit, React.ReactNode > > = {
	custom: <MathFunctionIcon fontSize="tiny" />,
};

export const SizeField = < T extends SizePropValue[ 'value' ], U extends SizeUnit >( {
	value,
	focused,
	disabled,
	InputProps,
	defaultUnit,
	placeholder,
	onUnitChange,
	startIcon,
	ariaLabel,
	onKeyDown,
	setValue,
	onBlur,
	units,
	min,
	unitSelectorProps,
}: SizeFieldProps< T, U > ) => {
	const { size, unit, setSize, setUnit } = useSizeValue( { value, setValue, units, defaultUnit } );

	const handleUnitChange = ( newUnit: SizeUnit ) => {
		setUnit( newUnit );

		onUnitChange?.( newUnit );
	};

	const { onUnitKeyDown } = useSizeUnitKeyboard( { unit, onUnitChange: handleUnitChange, units } );

	const handleKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		onUnitKeyDown( event );

		onKeyDown?.( event );
	};

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const newSize = event.target.value;
		const isInputValid = event.target.validity.valid;

		setSize( newSize, isInputValid );
	};

	const inputType = isExtendedUnit( unit ) ? 'text' : 'number';

	return (
		<SizeInput
			disabled={ disabled }
			focused={ focused }
			type={ inputType }
			value={ size }
			placeholder={ placeholder }
			onBlur={ onBlur }
			onKeyDown={ handleKeyDown }
			onChange={ handleChange }
			InputProps={ {
				...InputProps,
				autoComplete: 'off',
				readOnly: isExtendedUnit( unit ),
				startAdornment: startIcon && (
					<InputAdornment position="start" disabled={ disabled }>
						{ startIcon }
					</InputAdornment>
				),
				endAdornment: (
					<InputAdornment position="end">
						<UnitSelector< U >
							options={ units }
							value={ unit as U }
							onSelect={ handleUnitChange }
							isActive={ unitSelectorProps?.isActive ?? hasSizeValue( size ) }
							{ ...unitSelectorProps }
							optionLabelOverrides={ UNIT_DISPLAY_LABELS_OVERRIDES }
						/>
					</InputAdornment>
				),
			} }
			inputProps={ { min, step: 'any', 'arial-label': ariaLabel } }
		/>
	);
};
