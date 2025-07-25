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
				{ __( 'Delete this variable?', 'elementor' ) }
			</DialogTitle>
			<DialogContent>
				<DialogContentText variant="body2" color="textPrimary">
					{ __( 'All elements using', 'elementor' ) }
					<Typography variant="subtitle2" component="span">
						&nbsp;{ label }&nbsp;
					</Typography>
					{ __( 'will keep their current values, but the variable itself will be removed.', 'elementor' ) }
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button color="secondary" onClick={ closeDialog }>
					{ __( 'Not now', 'elementor' ) }
				</Button>
				<Button variant="contained" color="error" onClick={ onConfirm }>
					{ __( 'Delete', 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
};
