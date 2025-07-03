import { useState } from 'react';

import { type ValidationEvent, type ValidationResult } from './types';

export function useInputState( validate?: ( value: string, event: ValidationEvent ) => ValidationResult ) {
	const [ inputValue, setInputValue ] = useState( '' );
	const [ error, setError ] = useState< string | null >( null );

	const handleInputChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const { value } = event.target;

		setInputValue( value );

		if ( ! validate ) {
			return;
		}

		if ( ! value ) {
			setError( null );
			return;
		}

		const { isValid, errorMessage } = validate( value, 'inputChange' );

		if ( isValid ) {
			setError( null );
		} else {
			setError( errorMessage );
		}
	};

	const handleInputBlur = () => {
		setInputValue( '' );
		setError( null );
	};

	return {
		inputValue,
		setInputValue,
		error,
		setError,
		inputHandlers: {
			onChange: handleInputChange,
			onBlur: handleInputBlur,
		},
	};
}

export function useOpenState( initialOpen: boolean = false ) {
	const [ open, setOpen ] = useState( initialOpen );

	const openDropdown = () => setOpen( true );
	const closeDropdown = () => setOpen( false );

	return { open, openDropdown, closeDropdown };
}
