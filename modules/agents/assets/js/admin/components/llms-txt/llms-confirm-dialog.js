import { useState } from 'react';
import Alert from '@elementor/ui/Alert';
import Button from '@elementor/ui/Button';
import Dialog from '@elementor/ui/Dialog';
import DialogActions from '@elementor/ui/DialogActions';
import DialogContent from '@elementor/ui/DialogContent';
import DialogHeader from '@elementor/ui/DialogHeader';
import DialogTitle from '@elementor/ui/DialogTitle';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { DIALOG_Z_INDEX } from '../content-preview-dialog';

const getErrorMessage = ( reason ) => ( 'string' === typeof reason && reason )
	? reason
	: __( 'Something went wrong. Please try again.', 'elementor' );

export const LlmsConfirmDialog = ( { title, message, confirmLabel, onConfirm, onClose } ) => {
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ error, setError ] = useState( '' );

	const handleConfirm = () => {
		setIsSubmitting( true );
		setError( '' );

		onConfirm()
			.then( onClose )
			.catch( ( reason ) => {
				setError( getErrorMessage( reason ) );
				setIsSubmitting( false );
			} );
	};

	return (
		<Dialog open maxWidth="xs" fullWidth onClose={ onClose } sx={ { zIndex: DIALOG_Z_INDEX } }>
			<DialogHeader onClose={ onClose } logo={ false }>
				<DialogTitle>{ title }</DialogTitle>
			</DialogHeader>
			<DialogContent>
				{ error && <Alert severity="error" sx={ { mb: 2 } }>{ error }</Alert> }
				<Typography variant="body2">{ message }</Typography>
			</DialogContent>
			<DialogActions>
				<Button color="secondary" onClick={ onClose } disabled={ isSubmitting }>
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				<Button variant="contained" onClick={ handleConfirm } disabled={ isSubmitting }>
					{ confirmLabel }
				</Button>
			</DialogActions>
		</Dialog>
	);
};

LlmsConfirmDialog.propTypes = {
	title: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	confirmLabel: PropTypes.string.isRequired,
	onConfirm: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
};
