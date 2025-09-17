import * as React from 'react';
import { useState } from 'react';
import { TextField, type TextFieldProps } from '@elementor/ui';

import { validateLabel, VARIABLE_LABEL_MAX_LENGTH } from '../../utils/validations';
function isLabelEqual( a: string, b: string ) {
	return a.trim().toLowerCase() === b.trim().toLowerCase();
}

type LabelErrorProps = {
	value: string;
	message: string;
};

export const useLabelError = ( initialError?: LabelErrorProps ) => {
	const [ error, setError ] = useState< LabelErrorProps >( initialError ?? { value: '', message: '' } );

	return {
		labelFieldError: error,
		setLabelFieldError: setError,
	};
};

type LabelFieldProps = {
	value: string;
	error?: LabelErrorProps;
	onChange: ( value: string ) => void;
	id?: string;
	onErrorChange?: ( errorMsg: string ) => void;
	size?: TextFieldProps[ 'size' ];
	focusOnShow?: boolean;
};

export const LabelField = ( {
	value,
	error,
	onChange,
	id,
	onErrorChange,
	size = 'tiny',
	focusOnShow = false,
}: LabelFieldProps ) => {
	const [ label, setLabel ] = useState( value );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const handleChange = ( newValue: string ) => {
		setLabel( newValue );

		const errorMsg = validateLabel( newValue );

		setErrorMessage( errorMsg );
		onErrorChange?.( errorMsg );

		onChange( isLabelEqual( newValue, error?.value ?? '' ) || errorMsg ? '' : newValue );
	};

	let errorMsg = errorMessage;
	if ( isLabelEqual( label, error?.value ?? '' ) && error?.message ) {
		errorMsg = error.message;
	}

	return (
		<TextField
			id={ id }
			size={ size }
			fullWidth
			value={ label }
			error={ !! errorMsg }
			onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => handleChange( e.target.value ) }
			inputProps={ { maxLength: VARIABLE_LABEL_MAX_LENGTH } }
			// eslint-disable-next-line jsx-a11y/no-autofocus
			autoFocus={ focusOnShow }
		/>
	);
};
