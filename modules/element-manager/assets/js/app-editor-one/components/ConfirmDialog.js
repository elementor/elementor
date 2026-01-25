import {
	Button,
	Stack,
	Box,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

export const ConfirmDialog = ( { isOpen, onClose, onConfirm } ) => {
	return (
		<Dialog open={ isOpen } onClose={ onClose } maxWidth="sm">
			<DialogTitle>
				{ __( 'Sure you want to save these changes?', 'elementor' ) }
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{ __( 'Turning widgets off will hide them from the editor panel, and can potentially affect your layout or front-end.', 'elementor' ) }
					<Box component="span" sx={ { display: 'block', mt: 2.5 } }>
						{ __( 'If you\'re adding widgets back in, enjoy them!', 'elementor' ) }
					</Box>
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Stack direction="row" gap={ 2 } justifyContent="flex-end">
					<Button
						variant="outlined"
						color="secondary"
						onClick={ onClose }
						className="e-id-elementor-element-manager-modal-button-cancel"
					>
						{ __( 'Cancel', 'elementor' ) }
					</Button>
					<Button
						variant="contained"
						onClick={ onConfirm }
						className="e-id-elementor-element-manager-modal-button-save"
					>
						{ __( 'Save', 'elementor' ) }
					</Button>
				</Stack>
			</DialogActions>
		</Dialog>
	);
};

ConfirmDialog.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onConfirm: PropTypes.func.isRequired,
};

