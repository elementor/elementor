import { useEffect, useRef } from 'react';

// Automatically selects the default text in the text field when component mounts
export const useTextFieldAutoSelect = () => {
	const inputRef = useRef< HTMLInputElement >( null );

	useEffect( () => {
		if ( inputRef.current ) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, [] );

	return inputRef;
};
