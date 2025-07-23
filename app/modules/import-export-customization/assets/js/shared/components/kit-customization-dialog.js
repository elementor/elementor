import {
        Dialog,
        DialogHeader,
        DialogTitle,
        DialogContent,
        DialogActions,
        Button,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

export function KitCustomizationDialog( {
	open,
	title,
	handleClose,
	handleSaveChanges,
	children,
	saveDisabled = false,
	minHeight = '600px',
} ) {
	return (
		<Dialog
			open={ open }
			onClose={ handleClose }
			maxWidth="md"
			fullWidth
			PaperProps={ {
				sx: {
					minHeight: minHeight,
				},
			} }
		>
			<DialogHeader onClose={ handleClose }>
				<DialogTitle>
					{ title }
				</DialogTitle>
			</DialogHeader>

			<DialogContent dividers sx={ { p: 3 } }>
				{ children }
			</DialogContent>

			<DialogActions>
				<Button
					onClick={ handleClose }
					color="secondary"
				>
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				<Button
					disabled={ saveDisabled }
					onClick={ () => {
						handleSaveChanges();
						handleClose();
					} }
					variant="contained"
					color="primary"
				>
					{ __( 'Save changes', 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
}

KitCustomizationDialog.propTypes = {
	open: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	handleSaveChanges: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
	title: PropTypes.string.isRequired,
	saveDisabled: PropTypes.bool,
};
