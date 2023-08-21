import { Dialog, DialogContent, Paper } from '@elementor/ui';
import Draggable from 'react-draggable';
import DialogHeader from './dialog-header';

const DraggablePaper = ( props ) => (
	<Draggable handle=".MuiDialogTitle-root" cancel={ '[class*="MuiDialogContent-root"]' } bounds="parent">
		<Paper { ...props } />
	</Draggable>
);

const PromptDialog = ( props ) => {
	return (
		<Dialog
			scroll="paper"
			open={ true }
			fullWidth={ true }
			hideBackdrop={ true }
			PaperComponent={ DraggablePaper }
			disableScrollLock={ true }
			sx={ {
				'& .MuiDialog-container': {
					alignItems: 'flex-start',
					mt: '18vh',
				},
			} }
			PaperProps={ {
				sx: {
					m: 0,
					maxHeight: '76vh',
				},
			} }
			{ ...props }
		>
			{ props.children }
		</Dialog>
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
