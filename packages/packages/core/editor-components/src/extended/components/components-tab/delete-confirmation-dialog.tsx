import * as React from 'react';
import { ConfirmationDialog } from '@elementor/editor-ui';
import { __ } from '@wordpress/i18n';

type DeleteConfirmationDialogProps = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
};

export function DeleteConfirmationDialog( { open, onClose, onConfirm }: DeleteConfirmationDialogProps ) {
	return (
		<ConfirmationDialog open={ open } onClose={ onClose }>
			<ConfirmationDialog.Title>{ __( 'Delete this component?', 'elementor' ) }</ConfirmationDialog.Title>
			<ConfirmationDialog.Content>
				<ConfirmationDialog.ContentText>
					{ __(
						'Existing instances on your pages will remain functional. You will no longer find this component in your list.',
						'elementor'
					) }
				</ConfirmationDialog.ContentText>
			</ConfirmationDialog.Content>
			<ConfirmationDialog.Actions onClose={ onClose } onConfirm={ onConfirm } />
		</ConfirmationDialog>
	);
}
