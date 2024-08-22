import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const UnsavedChangesAlert = ( { onClose, onCancel, title, text, ...props } ) => {
	return (
		<Dialog
			aria-labelledby="unsaved-changes-alert-title"
			aria-describedby="unsaved-changes-alert-description"
			{ ...props }
		>
			<DialogTitle id="unsaved-changes-alert-title">
				{ title }
			</DialogTitle>

			<DialogContent>
				<DialogContentText id="unsaved-changes-alert-description">
					{ text }
				</DialogContentText>
			</DialogContent>

			<DialogActions>
				<Button onClick={ onCancel } color="secondary">
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				<Button onClick={ onClose } color="error" variant="contained">
					{ __( 'Yes, leave', 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
};

UnsavedChangesAlert.propTypes = {
	title: PropTypes.string,
	text: PropTypes.string,
	onCancel: PropTypes.func,
	onClose: PropTypes.func,
};

export default UnsavedChangesAlert;
