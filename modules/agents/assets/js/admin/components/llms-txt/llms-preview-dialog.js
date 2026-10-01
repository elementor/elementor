import { useState } from 'react';
import Alert from '@elementor/ui/Alert';
import Box from '@elementor/ui/Box';
import Button from '@elementor/ui/Button';
import Dialog from '@elementor/ui/Dialog';
import DialogActions from '@elementor/ui/DialogActions';
import DialogContent from '@elementor/ui/DialogContent';
import DialogHeader from '@elementor/ui/DialogHeader';
import DialogTitle from '@elementor/ui/DialogTitle';
import TextField from '@elementor/ui/TextField';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { LLMS_FILE_NAME } from '../../constants';

const EDITOR_MIN_ROWS = 20;

const getErrorMessage = ( reason ) => ( 'string' === typeof reason && reason )
	? reason
	: __( 'Something went wrong. Please try again.', 'elementor' );

export const LlmsPreviewDialog = ( { content, isEditing, onClose, onSave } ) => {
	const [ draft, setDraft ] = useState( content );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ error, setError ] = useState( '' );

	const isSaveDisabled = isSaving || ! draft.trim() || draft === content;

	const handleSave = () => {
		setIsSaving( true );
		setError( '' );

		onSave( draft )
			.then( onClose )
			.catch( ( reason ) => {
				setError( getErrorMessage( reason ) );
				setIsSaving( false );
			} );
	};

	return (
		<Dialog open maxWidth="lg" fullWidth onClose={ onClose }>
			<DialogHeader onClose={ onClose } logo={ false }>
				<DialogTitle>{ LLMS_FILE_NAME }</DialogTitle>
			</DialogHeader>
			<DialogContent dividers>
				{ error && <Alert severity="error" sx={ { mb: 2 } }>{ error }</Alert> }
				{ isEditing ? (
					<TextField
						value={ draft }
						onChange={ ( event ) => setDraft( event.target.value ) }
						multiline
						fullWidth
						minRows={ EDITOR_MIN_ROWS }
						inputProps={ { 'aria-label': LLMS_FILE_NAME } }
						InputProps={ { sx: { fontFamily: 'monospace' } } }
					/>
				) : (
					<Box component="pre" sx={ { m: 0, typography: 'body2', fontFamily: 'monospace', whiteSpace: 'pre-wrap' } }>
						{ content }
					</Box>
				) }
			</DialogContent>
			{ isEditing && (
				<DialogActions>
					<Button color="secondary" onClick={ onClose }>
						{ __( 'Cancel', 'elementor' ) }
					</Button>
					<Button variant="contained" onClick={ handleSave } disabled={ isSaveDisabled }>
						{ __( 'Save', 'elementor' ) }
					</Button>
				</DialogActions>
			) }
		</Dialog>
	);
};

LlmsPreviewDialog.propTypes = {
	content: PropTypes.string.isRequired,
	isEditing: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onSave: PropTypes.func.isRequired,
};
