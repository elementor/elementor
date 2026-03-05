import * as React from 'react';
import type { PropValue, SizePropValue } from '@elementor/editor-props';
import { MathFunctionIcon } from '@elementor/icons';
import { InputAdornment, type TextFieldProps } from '@elementor/ui';

import { useSizeUnitKeyboard } from './hooks/use-size-unit-keyboard';
import { useSizeValue } from './hooks/use-size-value';
import { type SizeUnit } from './types';
import { SizeInput } from './ui/size-input';
import { UnitSelector, type UnitSelectorProps } from './ui/unit-selector';
import { isExtendedUnit } from './utils/is-extended-unit';

export type SizeFieldProps< TValue, TUnit extends SizeUnit > = {
	units: TUnit[];
	value: TValue | null;
	placeholder?: string;
	defaultUnit?: SizeUnit;
	startIcon?: React.ReactNode;
	onChange: ( value: TValue | null ) => void;
	onBlur?: ( event: React.FocusEvent< HTMLInputElement > ) => void;
	onKeyDown?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
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
	startIcon,
	onKeyDown,
	onChange,
	onBlur,
	units,
	unitSelectorProps,
}: SizeFieldProps< T, U > ) => {
	const { size, unit, setSize, setUnit } = useSizeValue( { value, onChange, units, defaultUnit } );
	const { onUnitKeyDown } = useSizeUnitKeyboard( { unit, onUnitChange: setUnit, units } );

	const handleKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		onUnitKeyDown( event );
		onKeyDown?.( event );
	};

	const inputType = isExtendedUnit( unit ) ? 'text' : 'number';

	return (
		<SizeInput
			type={ inputType }
			value={ size }
			onBlur={ onBlur }
			onKeyDown={ handleKeyDown }
			onChange={ ( event ) => setSize( event.target.value ) }
			InputProps={ {
				...InputProps,
				autoComplete: 'off',
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
							onSelect={ ( newUnit ) => setUnit( newUnit ) }
							isActive={ hasValue( size ) }
							{ ...unitSelectorProps }
							optionLabelOverrides={ UNIT_DISPLAY_LABELS_OVERRIDES }
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
