import * as React from 'react';
import { forwardRef, useState } from 'react';
import { TextField, type TextFieldProps } from '@elementor/ui';

const RESTRICTED_INPUT_KEYS = [ 'e', 'E', '+' ];

export const NumberInput = forwardRef( ( props: TextFieldProps, ref ) => {
	const [ key, setKey ] = useState< number >( 0 );

	const handleKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		blockRestrictedKeys( event, props.inputProps?.min );

		props.onKeyDown?.( event );
	};

	const handleBlur = ( event: React.FocusEvent< HTMLInputElement > ) => {
		props.onBlur?.( event );

		const { valid } = event.target.validity;

		// HTML number input quirk: invalid input (e.g. "-9-") returns value="" but displays "-9-" to user,
		// so when we revert to last valid value we must re-mount the component to actually display it.
		if ( ! valid ) {
			setKey( ( prev ) => prev + 1 );
		}
	};

	return <TextField { ...props } ref={ ref } key={ key } onKeyDown={ handleKeyDown } onBlur={ handleBlur } />;
} );

function blockRestrictedKeys( event: React.KeyboardEvent< HTMLInputElement >, min: number ) {
	const restrictedInputKeys = [ ...RESTRICTED_INPUT_KEYS ];

	if ( min >= 0 ) {
		restrictedInputKeys.push( '-' );
	}

	if ( restrictedInputKeys.includes( event.key ) ) {
		event.preventDefault();
	}
}
