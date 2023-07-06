import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@elementor/ui';

const UnsavedChangesAlert = ( { onClose, onCancel, ...props } ) => {
	return (
		<Dialog
			aria-labelledby="unsaved-changes-alert-title"
			aria-describedby="unsaved-changes-alert-description"
			{ ...props }
		>
			<DialogTitle id="unsaved-changes-alert-title">
				{ __( 'Leave Elementor AI?', 'elementor' ) }
			</DialogTitle>

			<DialogContent>
				<DialogContentText id="unsaved-changes-alert-description">
					{ __( 'Images will be gone forever and we won’t be able to recover them.', 'elementor' ) }
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
	onClose: PropTypes.func,
	onCancel: PropTypes.func,
};

export default UnsavedChangesAlert;
