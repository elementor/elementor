import { Dialog, DialogContent } from '@elementor/ui';
import DialogHeader from './dialog-header';

const WizardDialog = ( props ) => {
	return (
		<Dialog
			open={ true }
			onClose={ props.onClose }
			fullWidth={ true }
			hideBackdrop={ true }
			maxWidth="lg"
			PaperProps={ {
				sx: {
					height: '88vh',
				},
			} }
			sx={ { zIndex: 9999 } }
		>
			{ props.children }
		</Dialog>
	);
};

WizardDialog.propTypes = {
	onClose: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
};

const WizardDialogContent = ( { sx = {}, ...props } ) => (
	<DialogContent { ...props } sx={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', ...sx } } />
);

WizardDialogContent.propTypes = {
	sx: PropTypes.object,
};

WizardDialog.Header = DialogHeader;
WizardDialog.Content = WizardDialogContent;

export default WizardDialog;
