import { useState } from 'react';
import Alert from '@elementor/ui/Alert';
import Button from '@elementor/ui/Button';
import Stack from '@elementor/ui/Stack';
import TextField from '@elementor/ui/TextField';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { wpAdminInputResetSx } from '../wp-admin-sx';

const EDITOR_ROWS = 3;

const fieldSx = {
	...wpAdminInputResetSx,
	'& .MuiInputBase-input': { typography: 'body2' },
};

export const CustomTextSection = ( { customText, maxLength, isDisabled, onSave } ) => {
	const [ draft, setDraft ] = useState( customText );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ error, setError ] = useState( '' );

	const isSaveDisabled = isDisabled || isSaving || draft.trim() === customText;

	const handleSubmit = ( event ) => {
		event.preventDefault();
		setIsSaving( true );
		setError( '' );

		onSave( draft )
			.catch( setError )
			.finally( () => setIsSaving( false ) );
	};

	return (
		<Stack component="form" spacing={ 1 } onSubmit={ handleSubmit }>
			<Stack spacing={ 0.5 }>
				<Typography variant="subtitle1">{ __( 'Instructions for agents', 'elementor' ) }</Typography>
				<Typography variant="body2" color="text.secondary">
					{ __( 'Tell AI agents how to use your site. Added to the top of llms.txt. Auto-sync stays on.', 'elementor' ) }
				</Typography>
			</Stack>
			{ error && <Alert severity="error">{ error }</Alert> }
			<TextField
				value={ draft }
				onChange={ ( event ) => setDraft( event.target.value ) }
				multiline
				fullWidth
				rows={ EDITOR_ROWS }
				disabled={ isDisabled }
				inputProps={ { 'aria-label': __( 'Instructions for agents', 'elementor' ), maxLength } }
				sx={ fieldSx }
			/>
			<Stack direction="row" spacing={ 1 } alignItems="center">
				<Typography variant="body2" color="text.secondary" flexGrow={ 1 }>
					{ `${ draft.length.toLocaleString() }/${ maxLength.toLocaleString() }` }
				</Typography>
				<Button type="submit" variant="contained" size="small" disabled={ isSaveDisabled }>
					{ __( 'Save', 'elementor' ) }
				</Button>
			</Stack>
		</Stack>
	);
};

CustomTextSection.propTypes = {
	customText: PropTypes.string.isRequired,
	maxLength: PropTypes.number.isRequired,
	isDisabled: PropTypes.bool.isRequired,
	onSave: PropTypes.func.isRequired,
};
