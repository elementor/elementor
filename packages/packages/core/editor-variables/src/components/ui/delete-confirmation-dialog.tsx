import * as React from 'react';
import { ConfirmationDialog } from '@elementor/editor-ui';
import { Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type DeleteConfirmationDialogProps = {
	open: boolean;
	label: string;
	closeDialog: () => void;
	onConfirm: () => void;
};

export const DeleteConfirmationDialog = ( { open, label, closeDialog, onConfirm }: DeleteConfirmationDialogProps ) => {
	return (
		<ConfirmationDialog open={ open } onClose={ closeDialog }>
			<ConfirmationDialog.Title>{ __( 'Delete this variable?', 'elementor' ) }</ConfirmationDialog.Title>
			<ConfirmationDialog.Content>
				<ConfirmationDialog.ContentText>
					{ __( 'All elements using', 'elementor' ) }
					&nbsp;
					<Typography variant="subtitle2" component="span" sx={ { lineBreak: 'anywhere' } }>
						{ label }
					</Typography>
					&nbsp;
					{ __( 'will keep their current values, but the variable itself will be removed.', 'elementor' ) }
				</ConfirmationDialog.ContentText>
			</ConfirmationDialog.Content>
			<ConfirmationDialog.Actions onClose={ closeDialog } onConfirm={ onConfirm } />
		</ConfirmationDialog>
	);
};
