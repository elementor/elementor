import * as React from 'react';
import type { SizePropValue } from '@elementor/editor-props';
import { MathFunctionIcon } from '@elementor/icons';
import { InputAdornment, type TextFieldProps } from '@elementor/ui';

import { useSizeUnitKeyboard } from './hooks/use-size-unit-keyboard';
import { useSizeValue } from './hooks/use-size-value';
import { type SizeUnit } from './types';
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
	onChange: ( value: TValue ) => void;
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onKeyDown?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	onUnitChange?: ( unit: SizeUnit ) => void;
	disabled?: boolean;
	InputProps?: TextFieldProps[ 'InputProps' ];
	unitSelectorProps?: Partial< UnitSelectorProps< TUnit > >;
};

const UNIT_DISPLAY_LABELS_OVERRIDES: Partial< Record< SizeUnit, React.ReactNode > > = {
	custom: <MathFunctionIcon fontSize="tiny" />,
};

export const SizeField = < T extends SizePropValue[ 'value' ], U extends SizeUnit >( {
	value,
	disabled,
	InputProps,
	defaultUnit,
	placeholder,
	onUnitChange,
	startIcon,
	onKeyDown,
	onChange,
	onBlur,
	units,
	unitSelectorProps,
}: SizeFieldProps< T, U > ) => {
	const { size, unit, setSize, setUnit } = useSizeValue( { value, onChange, units, defaultUnit } );

	const handleUnitChange = ( newUnit: SizeUnit ) => {
		setUnit( newUnit );

		onUnitChange?.( newUnit );
	};

	const { onUnitKeyDown } = useSizeUnitKeyboard( { unit, onUnitChange: handleUnitChange, units } );

	const handleKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		onUnitKeyDown( event );

		onKeyDown?.( event );
	};

	// Does low level need to set null only high components
	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const newSize = event.target.value;
		const isInputValid = event.target.validity.valid; // We need to cover this

		if ( isInputValid ) {
			setSize( newSize );
		}
	};

	const inputType = isExtendedUnit( unit ) ? 'text' : 'number';

	return (
		<SizeInput
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
		/>
	);
};
