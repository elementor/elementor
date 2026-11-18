import { useState } from 'react';
import Alert from '@elementor/ui/Alert';
import Button from '@elementor/ui/Button';
import Stack from '@elementor/ui/Stack';
import TextField from '@elementor/ui/TextField';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { wpAdminInputResetSx } from '../wp-admin-sx';

const EDITOR_MIN_ROWS = 5;

const CustomTextForm = ( { customText, maxLength, onSave, onClose } ) => {
	const [ draft, setDraft ] = useState( customText );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ error, setError ] = useState( '' );

	const isSaveDisabled = isSaving || draft.trim() === customText;

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
				placeholder={ __( 'Add a short note about your site, shown at the top of llms.txt.', 'elementor' ) }
				helperText={ __( 'Leave empty to remove the custom text.', 'elementor' ) }
				inputProps={ { 'aria-label': __( 'Custom text', 'elementor' ), maxLength } }
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

CustomTextForm.propTypes = {
	customText: PropTypes.string.isRequired,
	maxLength: PropTypes.number,
	onSave: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
};

export const CustomTextSection = ( { customText, maxLength, isDisabled, onSave } ) => {
	const [ isEditing, setIsEditing ] = useState( false );

	return (
		<Stack spacing={ 1 }>
			<Typography variant="subtitle1">{ __( 'Custom text', 'elementor' ) }</Typography>
			<Typography variant="body2" color="text.secondary">
				{ __( 'Your text appears at the top of llms.txt, before your pages. It stays in place when the file updates automatically.', 'elementor' ) }
			</Typography>
			{ isEditing ? (
				<CustomTextForm
					customText={ customText }
					maxLength={ maxLength }
					onSave={ onSave }
					onClose={ () => setIsEditing( false ) }
				/>
			) : (
				<Button
					variant="outlined"
					size="small"
					disabled={ isDisabled }
					onClick={ () => setIsEditing( true ) }
					sx={ { alignSelf: 'flex-start' } }
				>
					{ customText ? __( 'Edit custom text', 'elementor' ) : __( 'Add custom text', 'elementor' ) }
				</Button>
			) }
		</Stack>
	);
};

CustomTextSection.propTypes = {
	customText: PropTypes.string.isRequired,
	maxLength: PropTypes.number,
	isDisabled: PropTypes.bool.isRequired,
	onSave: PropTypes.func.isRequired,
};
