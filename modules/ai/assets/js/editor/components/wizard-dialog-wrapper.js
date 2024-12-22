import WizardDialog from './wizard-dialog';
import React from 'react';

export const WizardDialogWrapper = ( props ) => <WizardDialog onClose={ props.onClose }>
	<WizardDialog.Header onClose={ props.onClose } />
	<WizardDialog.Content dividers>
		{ props.children }
	</WizardDialog.Content>
</WizardDialog>;

WizardDialogWrapper.propTypes = {
	onClose: PropTypes.func.isRequired,
	children: PropTypes.node.isRequired,
};
