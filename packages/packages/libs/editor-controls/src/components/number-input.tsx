import * as React from 'react';
import { forwardRef, useRef, useState } from 'react';
import { TextField, type TextFieldProps } from '@elementor/ui';

type Props = Omit< TextFieldProps, 'type' | 'value' | 'onChange' > & {
	value: number | null;
	onChange?: ( value: number | null ) => void;
	validate?: ( value: number | null ) => boolean;
	min?: number;
	max?: number;
	step?: number | 'any';
};

const RESTRICTED_INPUT_KEYS = [ 'e', 'E', '+' ];

/**
 * NumberInput - Custom number input with invalid input handling
 * 
 * Uses a two-state system:
 * - Inner state: The value that being displayed to the user
 * - External state: The validated value, passed to the onChange handler
 * 
 * On change: Updates inner state to raw user input, calls onChange with the validated value
 * On blur: Syncs both states:
 * - If the input is valid, sets both states to the input value
 * - If the input is invalid, reverts both states to the last valid value
 * 
 * This allows uninterrupted typing while ensuring external consumers receive valid data.
 * 
 * @example
 * User types "-9-" → Display shows "-9-" and onChange gets null
 * On blur → Reverts both states to last valid value
 */

export const NumberInput = forwardRef(
	(
		{
			value: externalValue,
			onChange,
			validate,
			// By default, we only allow positive values
			min = 0,
			max = Number.MAX_VALUE,
			// By default, we allow decimal values
			step = 'any',
			inputProps = {},
			...props
		}: Props,
		ref
	) => {
		// The value displayed to user
		const [ innerValue, setInnerValue ] = useState( numberToString( externalValue ) );
		
		const inputRef = useRef< HTMLInputElement >( null );

		const lastValidValue = useRef( numberToString( externalValue ) );

		const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
			const rawUserInput = event.target.value;
			
			// Update inner value to raw user input without validation
			setInnerValue( rawUserInput );
			
			// Send validated value to onChange
			const validatedValue = getValidatedValue( rawUserInput, validate );
			onChange?.( validatedValue );
		};

		const handleFocus = ( event: React.FocusEvent< HTMLInputElement > ) => {
			// Store current value for potential revert
			lastValidValue.current = event.target.value;
			inputProps?.onFocus?.( event );
		};

		const handleBlur = ( event: React.FocusEvent< HTMLInputElement > ) => {
			const { value: currentInput, validity: htmlValidity } = event.target;

			const parsedValue = stringToNumber( currentInput );
			const isCustomValid = isValid( parsedValue, validate );
			const isInputValid = isCustomValid && htmlValidity.valid;

			if ( isInputValid ) {
				syncBothStates( parsedValue );
			} else {
				revertToLastValidValue();
			}

			inputProps?.onBlur?.( event );
		};

		const syncBothStates = ( value: number | null ) => {
			// Set both states to the same valid value
			lastValidValue.current = numberToString( value );
			setInnerValue( numberToString( value ) );
			onChange?.( value);
		};

		
		const revertToLastValidValue = () => {
			if ( ! inputRef.current ) {
				return;
			}
			
			// Revert both states and input value to last valid value
			const revertValue = lastValidValue.current;

			// HTML number input quirk: invalid input (e.g. "-9-") returns value="" 
			// but displays "-9-" to user. When reverting to empty, no change event fires
			// since value is already "", so we must set inputRef.current.value explicitly.
			inputRef.current.value = revertValue;
			syncBothStates( stringToNumber( revertValue ) );
		};

		const handleKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
			const restrictedInputKeys = [ ...RESTRICTED_INPUT_KEYS ];

			const isNegativeValueAllowed = min < 0;
			const isDecimalValueAllowed = step === 'any' || ! Number.isInteger( step );

			if ( ! isDecimalValueAllowed ) {
				restrictedInputKeys.push( '.' );
			}
			if ( ! isNegativeValueAllowed ) {
				restrictedInputKeys.push( '-' );
			}

			if ( restrictedInputKeys.includes( event.key ) ) {
				event.preventDefault();
			}

			props.onKeyDown?.( event );
		};

		const _inputProps = {
			...inputProps,
			ref: inputRef,
			onBlur: handleBlur,
			onFocus: handleFocus,
			step,
			min,
			max,
		};

		return (
			<TextField
				{ ...props }
				ref={ ref }
				type="number"
				inputProps={ _inputProps }
				value={ innerValue }
				onChange={ handleChange }
				onKeyDown={ handleKeyDown }
			/>
		);
	}
);

function stringToNumber( value: string ): number | null {
	if ( value === '' ) {
		return null;
	}

	return Number( value );
}

function numberToString ( value: number | null ): string {
	return value == null ? '' : String( value );
}

function isValid ( value: number | null, validate?: ( value: number | null ) => boolean ): boolean {
	return validate ? validate( value ) : true;
}

function getValidatedValue ( value: string, validate?: ( value: number | null ) => boolean ): number | null {
	const number = stringToNumber( value );
	return isValid( number, validate ) ? number : null;
}
