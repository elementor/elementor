import * as React from 'react';
import { closeDialog, ConfirmationDialog, openDialog } from '@elementor/editor-ui';
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
			<ConfirmationDialog.Actions
				onClose={ onClose }
				onConfirm={ onConfirm }
				confirmLabel={ __( 'Detach', 'elementor' ) }
				color="primary"
			/>
		</ConfirmationDialog>
	);
}

export function openDetachConfirmDialog( onConfirm: () => void ) {
	const handleConfirm = () => {
		closeDialog();
		onConfirm();
	};

	openDialog( {
		component: <DetachInstanceConfirmationDialog open onClose={ closeDialog } onConfirm={ handleConfirm } />,
	} );
}
