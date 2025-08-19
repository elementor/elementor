import * as React from 'react';
import { useId, useState } from 'react';
import { TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { labelHint, validateLabel, VARIABLE_LABEL_MAX_LENGTH } from '../../utils/validations';
import { FormField } from '../ui/form-field';

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
};

export const LabelField = ( { value, error, onChange }: LabelFieldProps ) => {
	const [ label, setLabel ] = useState( value );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ noticeMessage, setNoticeMessage ] = useState( () => labelHint( value ) );

	const handleChange = ( newValue: string ) => {
		setLabel( newValue );

		const errorMsg = validateLabel( newValue );
		const hintMsg = labelHint( newValue );

		setErrorMessage( errorMsg );
		setNoticeMessage( errorMsg ? '' : hintMsg );

		onChange( isLabelEqual( newValue, error?.value ?? '' ) || errorMsg ? '' : newValue );
	};

	const id = useId();

	let errorMsg = errorMessage;
	if ( isLabelEqual( label, error?.value ?? '' ) && error?.message ) {
		errorMsg = error.message;
	}

	const noticeMsg = errorMsg ? '' : noticeMessage;

	return (
		<FormField id={ id } label={ __( 'Name', 'elementor' ) } errorMsg={ errorMsg } noticeMsg={ noticeMsg }>
			<TextField
				id={ id }
				size="tiny"
				fullWidth
				value={ label }
				error={ !! errorMsg }
				onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => handleChange( e.target.value ) }
				inputProps={ { maxLength: VARIABLE_LABEL_MAX_LENGTH } }
			/>
		</FormField>
	);
};
