import Dialog from '@elementor/ui/Dialog';
import DialogActions from '@elementor/ui/DialogActions';
import DialogContent from '@elementor/ui/DialogContent';
import DialogHeader from '@elementor/ui/DialogHeader';
import DialogTitle from '@elementor/ui/DialogTitle';
import PropTypes from 'prop-types';

const WP_ADMIN_BAR_Z_INDEX = 99999;
const DIALOG_Z_INDEX = WP_ADMIN_BAR_Z_INDEX + 1;

export const ContentPreviewDialog = ( { title, onClose, children, actions = null } ) => {
	return (
		<Dialog
			open
			maxWidth="lg"
			fullWidth
			scroll="paper"
			onClose={ onClose }
			sx={ { zIndex: DIALOG_Z_INDEX } }
			PaperProps={ {
				sx: {
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					m: 0,
					maxHeight: 'calc(100% - 64px)',
				},
			} }
		>
			<DialogHeader onClose={ onClose } logo={ false }>
				<DialogTitle>{ title }</DialogTitle>
			</DialogHeader>
			<DialogContent dividers>
				{ children }
			</DialogContent>
			{ actions && <DialogActions>{ actions }</DialogActions> }
		</Dialog>
	);
};

ContentPreviewDialog.propTypes = {
	title: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
	actions: PropTypes.node,
};
