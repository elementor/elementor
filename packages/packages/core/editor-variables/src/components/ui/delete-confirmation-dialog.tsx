import * as React from 'react';
import { AlertOctagonFilledIcon } from '@elementor/icons';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const TITLE_ID = 'delete-variable-dialog';

export const DeleteConfirmationDialog = ( {
	open,
	label,
	closeDialog,
	onConfirm,
}: {
	open: boolean;
	label: string;
	closeDialog: () => void;
	onConfirm: () => void;
} ) => {
	return (
		<Dialog open={ open } onClose={ closeDialog } aria-labelledby={ TITLE_ID } maxWidth="xs">
			<DialogTitle id={ TITLE_ID } display="flex" alignItems="center" gap={ 1 } sx={ { lineHeight: 1 } }>
				<AlertOctagonFilledIcon color="error" />
				{ __( 'Delete Variable', 'elementor' ) }
			</DialogTitle>
			<DialogContent>
				<DialogContentText variant="body2" color="textPrimary">
					{ __( 'You are about to delete', 'elementor' ) }
					<Typography variant="subtitle2" component="span">
						&nbsp;{ label }&nbsp;
					</Typography>
					{ __(
						'Variable. Note that its value is still being used anywhere on your site where it was connected to the variable.',
						'elementor'
					) }
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button color="secondary" onClick={ closeDialog }>
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				<Button variant="contained" color="error" onClick={ onConfirm }>
					{ __( 'Delete', 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
};
