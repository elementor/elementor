import * as React from 'react';
import { ConfirmationDialog } from '@elementor/editor-ui';
import { __ } from '@wordpress/i18n';

type DetachInstanceConfirmationDialogProps = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
};

export function DetachInstanceConfirmationDialog( {
	open,
	onClose,
	onConfirm,
}: DetachInstanceConfirmationDialogProps ) {
	return (
		<ConfirmationDialog open={ open } onClose={ onClose }>
			<ConfirmationDialog.Title>{ __( 'Detach from Component?', 'elementor' ) }</ConfirmationDialog.Title>
			<ConfirmationDialog.Content>
				<ConfirmationDialog.ContentText>
					{ __(
						'Detaching this instance will break its link to the Component. Changes to the Component will no longer apply. Continue?',
						'elementor'
					) }
				</ConfirmationDialog.ContentText>
			</ConfirmationDialog.Content>
			<ConfirmationDialog.Actions onClose={ onClose } onConfirm={ onConfirm } />
		</ConfirmationDialog>
	);
}
