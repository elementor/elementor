import * as React from 'react';
import { useId, useState } from 'react';
import { FormHelperText, FormLabel, Grid, TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type SizeFieldProps = {
	value: string;
	onChange: ( value: string ) => void;
};

export const SizeField = ( { value, onChange }: SizeFieldProps ) => {
	const [ size, setSize ] = useState( value );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ noticeMessage, setNoticeMessage ] = useState( () => '' );

	const handleChange = ( newValue: string ) => {
		setSize( newValue );

		const errorMsg = ''; // validateLabel( newValue );
		const hintMsg = ''; // labelHint( newValue );

		setErrorMessage( errorMsg );
		setNoticeMessage( errorMsg ? '' : hintMsg );

		onChange( errorMsg ? '' : newValue );
	};

	const id = useId();

	return (
		<Grid container gap={ 0.75 } alignItems="center">
			<Grid item xs={ 12 }>
				<FormLabel htmlFor={ id } size="tiny">
					{ __( 'Size', 'elementor' ) }
				</FormLabel>
			</Grid>
			<Grid item xs={ 12 }>
				<TextField
					id={ id }
					size="tiny"
					fullWidth
					value={ size }
					error={ !! errorMessage }
					onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => handleChange( e.target.value ) }
				/>
				{ errorMessage && <FormHelperText error>{ errorMessage }</FormHelperText> }
				{ noticeMessage && <FormHelperText>{ noticeMessage }</FormHelperText> }
			</Grid>
		</Grid>
	);
};
