import * as React from 'react';
import { useState } from 'react';
import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControlLabel,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type StopSyncConfirmationDialogProps = {
	open: boolean;
	closeDialog: () => void;
	onConfirm: () => void;
	onSuppressMessage?: () => void;
	title: string;
	message: string;
	icon?: React.ReactNode;
};

export const StopSyncConfirmationDialog = ( {
	open,
	closeDialog,
	onConfirm,
	onSuppressMessage,
	title,
	message,
	icon,
}: StopSyncConfirmationDialogProps ) => {
	const [ dontShowAgain, setDontShowAgain ] = useState( false );

	const handleConfirm = () => {
		if ( dontShowAgain ) {
			onSuppressMessage?.();
		}
		onConfirm();
	};

	return (
		<Dialog open={ open } onClose={ closeDialog } maxWidth="sm">
			<DialogTitle display="flex" alignItems="center" gap={ 1 }>
				{ icon }
				{ title }
			</DialogTitle>
			<DialogContent>
				<DialogContentText variant="body2" color="secondary">
					{ message }
				</DialogContentText>
			</DialogContent>
			<DialogActions sx={ { justifyContent: 'space-between', alignItems: 'center' } }>
				<FormControlLabel
					control={
						<Checkbox
							checked={ dontShowAgain }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								setDontShowAgain( event.target.checked )
							}
							size="small"
						/>
					}
					label={ <Typography variant="body2" color="secondary">{ __( "Don't show this again", 'elementor' ) }</Typography> }
				/>
				<div>
					<Button color="secondary" onClick={ closeDialog }>
						{ __( 'Cancel', 'elementor' ) }
					</Button>
					<Button variant="contained" color="primary" onClick={ handleConfirm } sx={ { ml: 1 } }>
						{ __( 'Got it', 'elementor' ) }
					</Button>
				</div>
			</DialogActions>
		</Dialog>
	);
};
