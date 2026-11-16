import { useState } from 'react';
import Alert from '@elementor/ui/Alert';
import Button from '@elementor/ui/Button';
import Stack from '@elementor/ui/Stack';
import TextField from '@elementor/ui/TextField';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { wpAdminInputResetSx } from '../wp-admin-sx';

const EDITOR_MIN_ROWS = 5;

export const BusinessDetailsForm = ( { details, maxLength, onSave, onClose } ) => {
	const [ draft, setDraft ] = useState( details );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ error, setError ] = useState( '' );

	const isSaveDisabled = isSaving || draft.trim() === details;

	const handleSubmit = ( event ) => {
		event.preventDefault();
		setIsSaving( true );
		setError( '' );

		onSave( draft )
			.then( onClose )
			.catch( ( message ) => {
				setError( message );
				setIsSaving( false );
			} );
	};

	return (
		<Stack component="form" spacing={ 1.5 } onSubmit={ handleSubmit }>
			{ error && <Alert severity="error">{ error }</Alert> }
			<TextField
				value={ draft }
				onChange={ ( event ) => setDraft( event.target.value ) }
				multiline
				fullWidth
				minRows={ EDITOR_MIN_ROWS }
				placeholder={ __( 'Opening hours, phone number, email, address and social profiles. Leave empty to use your site’s structured data.', 'elementor' ) }
				helperText={ __( 'Agents use this text instead of the details found in your site’s structured data.', 'elementor' ) }
				inputProps={ { 'aria-label': __( 'Business details', 'elementor' ), maxLength } }
				sx={ wpAdminInputResetSx }
			/>
			<Stack direction="row" spacing={ 1 }>
				<Button type="submit" variant="contained" size="small" disabled={ isSaveDisabled }>
					{ __( 'Save', 'elementor' ) }
				</Button>
				<Button type="button" color="secondary" size="small" onClick={ onClose } disabled={ isSaving }>
					{ __( 'Cancel', 'elementor' ) }
				</Button>
			</Stack>
		</Stack>
	);
};

BusinessDetailsForm.propTypes = {
	details: PropTypes.string.isRequired,
	maxLength: PropTypes.number,
	onSave: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
};
