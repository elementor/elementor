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
				maxWidth={ props.maxWidth || 'sm' }
				sx={ {
					'& .MuiDialog-container': {
						alignItems: 'flex-start',
						mt: '15vh',
					},
				} }
				PaperProps={ {
					sx: {
						maxHeight: '76vh',
					},
				} }
				scroll="paper"
			>
				{ props.children }
			</Dialog>
		</Draggable>
	);
};

PromptDialog.propTypes = {
	onClose: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
	maxWidth: PropTypes.oneOf( [ 'xs', 'sm', 'md', 'lg', 'xl', false ] ),
};

PromptDialog.Header = DialogHeader;
PromptDialog.Content = DialogContent;

export default PromptDialog;
