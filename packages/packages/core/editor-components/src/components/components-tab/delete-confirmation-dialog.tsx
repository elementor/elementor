import * as React from 'react';
import { AlertOctagonFilledIcon } from '@elementor/icons';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const TITLE_ID = 'delete-component-dialog';

type DeleteConfirmationDialogProps = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
};

export function DeleteConfirmationDialog( { open, onClose, onConfirm }: DeleteConfirmationDialogProps ) {
	return (
		<Dialog open={ open } onClose={ onClose } aria-labelledby={ TITLE_ID } maxWidth="xs">
			<DialogTitle id={ TITLE_ID } display="flex" alignItems="center" gap={ 1 } sx={ { lineHeight: 1 } }>
				<AlertOctagonFilledIcon color="error" />
				{ __( 'Delete this component?', 'elementor' ) }
			</DialogTitle>
			<DialogContent>
				<DialogContentText variant="body2" color="textPrimary">
					{ __(
						'Existing instances on your pages will remain functional. You will no longer find this component in your list.',
						'elementor'
					) }
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button color="secondary" onClick={ onClose }>
					{ __( 'Not now', 'elementor' ) }
				</Button>
				<Button
					autoFocus
					variant="contained"
					color="error"
					onClick={ onConfirm }
				>
					{ __( 'Delete', 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
}

