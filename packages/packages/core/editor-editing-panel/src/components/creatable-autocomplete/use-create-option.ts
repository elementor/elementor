import { useState } from 'react';

import { type ValidationEvent, type ValidationResult } from './types';

export function useCreateOption( params: {
	onCreate?: ( value: string ) => Promise< unknown > | unknown;
	validate?: ( value: string, event: ValidationEvent ) => ValidationResult;
	setInputValue: ( value: string ) => void;
	setError: ( error: string | null ) => void;
	closeDropdown: () => void;
} ) {
	const { onCreate, validate, setInputValue, setError, closeDropdown } = params;

	const [ loading, setLoading ] = useState( false );

	if ( ! onCreate ) {
		return { createOption: null, loading: false };
	}

	const createOption = async ( value: string ) => {
		setLoading( true );

		if ( validate ) {
			const { isValid, errorMessage } = validate( value, 'create' );

			if ( ! isValid ) {
				setError( errorMessage );
				setLoading( false );
				return;
			}
		}

		try {
			setInputValue( '' );
			closeDropdown();
			await onCreate( value );
		} catch {
			// TODO: Do something with the error.
		} finally {
			setLoading( false );
		}
	};

	return { createOption, loading };
}
