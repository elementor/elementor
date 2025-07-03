import * as React from 'react';
import { useId, useState } from 'react';
import { FormHelperText, FormLabel, Grid, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { labelHint, validateLabel, VARIABLE_LABEL_MAX_LENGTH } from '../../utils/validations';

type LabelFieldProps = {
	value: string;
	onChange: ( value: string ) => void;
};

export const LabelField = ( { value, onChange }: LabelFieldProps ) => {
	const [ label, setLabel ] = useState( value );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ noticeMessage, setNoticeMessage ] = useState( () => labelHint( value ) );

	const handleChange = ( newValue: string ) => {
		setLabel( newValue );

		const errorMsg = validateLabel( newValue );
		const hintMsg = labelHint( newValue );

		setErrorMessage( errorMsg );
		setNoticeMessage( errorMsg ? '' : hintMsg );

		onChange( errorMsg ? '' : newValue );
	};

	const id = useId();

	return (
		<Grid container gap={ 0.75 } alignItems="center">
			<Grid item xs={ 12 }>
				<FormLabel htmlFor={ id } size="tiny">
					{ __( 'Name', 'elementor' ) }
				</FormLabel>
			</Grid>
			<Grid item xs={ 12 }>
				<TextField
					id={ id }
					size="tiny"
					fullWidth
					value={ label }
					error={ !! errorMessage }
					onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => handleChange( e.target.value ) }
					inputProps={ { maxLength: VARIABLE_LABEL_MAX_LENGTH } }
				/>
				{ errorMessage && <FormHelperText error>{ errorMessage }</FormHelperText> }
				{ noticeMessage && <FormHelperText>{ noticeMessage }</FormHelperText> }
			</Grid>
		</Grid>
	);
};
