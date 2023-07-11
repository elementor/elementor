import { Dialog, DialogContent } from '@elementor/ui';
import Draggable from 'react-draggable';
import DialogHeader from './dialog-header';

const PromptDialog = ( props ) => {
	return (
		<Draggable handle=".MuiDialogTitle-root" cancel={ '[class*="MuiDialogContent-root"]' }>
			<Dialog
				open={ true }
				onClose={ props.onClose }
				fullWidth={ true }
				hideBackdrop={ true }
				maxWidth="sm"
				sx={ {
					'& .MuiDialog-container': {
						alignItems: 'flex-start',
						mt: '17vh',
					},
				} }
				PaperProps={ {
					sx: {
						maxHeight: '72vh',
					},
				} }
			>
				<DialogHeader onClose={ props.onClose }>
					{ props.headerAction }
				</DialogHeader>

				<DialogContent>
					{ props.children }
				</DialogContent>
			</Dialog>
		</Draggable>
	);
};

PromptDialog.propTypes = {
	headerAction: PropTypes.node,
	onClose: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
};

export default PromptDialog;
