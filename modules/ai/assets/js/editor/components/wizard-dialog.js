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
			<DialogHeader onClose={ props.onClose }>
				{ props.headerAction }
			</DialogHeader>

			<DialogContent sx={ { display: 'flex', flexDirection: 'column', justifyContent: 'center' } }>
				{ props.children }
			</DialogContent>
		</Dialog>
	);
};

WizardDialog.propTypes = {
	headerAction: PropTypes.node,
	onClose: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
};

export default WizardDialog;
