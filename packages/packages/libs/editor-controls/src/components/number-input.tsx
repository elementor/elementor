import * as React from 'react';
import { forwardRef, useState } from 'react';
import { TextField, type TextFieldProps } from '@elementor/ui';

type NumberInputProps = TextFieldProps & {
	allowNegative?: boolean;
};

const RESTRICTED_INPUT_KEYS = [ 'e', 'E', '+' ];

export const NumberInput = forwardRef( ( { allowNegative = false, ...props }: NumberInputProps, ref ) => {
	const [ key, setKey ] = useState< string | null >( null );

	const handleKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		blockRestrictedKeys( event, allowNegative );

		props.onKeyDown?.( event );
	};

	const handleBlur = ( event: React.FocusEvent< HTMLInputElement > ) => {
		props.onBlur?.( event );

		const { valid } = event.target.validity;

		// HTML number input quirk: invalid input (e.g. "-9-") returns value="" but displays "-9-" to user,
		// so when we revert to last valid value we must re-render the component to actually display it.
		if ( ! valid ) {
			setKey( String( Math.random() ) );
		}
	};

	return (
		<TextField
			{ ...props }
			ref={ ref }
			key={ key }
			onKeyDown={ handleKeyDown }
			onBlur={ handleBlur }
			inputProps={ {
				...props.inputProps,
				min: props.inputProps?.min ?? ( allowNegative ? undefined : 0 ),
			} }
		/>
	);
} );

function blockRestrictedKeys( event: React.KeyboardEvent< HTMLInputElement >, allowNegative: boolean ) {
	const restrictedInputKeys = [ ...RESTRICTED_INPUT_KEYS ];

	if ( ! allowNegative ) {
		restrictedInputKeys.push( '-' );
	}

	if ( restrictedInputKeys.includes( event.key ) ) {
		event.preventDefault();
	}
}
