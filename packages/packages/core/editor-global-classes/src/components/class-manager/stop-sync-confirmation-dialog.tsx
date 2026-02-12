import * as React from 'react';
import { useState } from 'react';
import { ColorSwatchIcon } from '@elementor/icons';
import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	FormControlLabel,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type StopSyncConfirmationDialogProps = {
	open: boolean;
	closeDialog: () => void;
	onConfirm: () => void;
	onSuppressMessage?: () => void;
};

export const StopSyncConfirmationDialog = ( {
	open,
	closeDialog,
	onConfirm,
	onSuppressMessage,
}: StopSyncConfirmationDialogProps ) => {
	const [ dontShowAgain, setDontShowAgain ] = useState( false );

	const handleConfirm = () => {
		if ( dontShowAgain ) {
			onSuppressMessage?.();
		}
		onConfirm();
	};

	return (
		<Dialog open={ open } onClose={ closeDialog } maxWidth="small">
			<DialogTitle display="flex" alignItems="center" gap={ 1 }>
				<ColorSwatchIcon color="secondary" />
				{ __( 'Un-sync typography class', 'elementor' ) }
			</DialogTitle>
			<Divider />
			<DialogContent>
				<DialogContentText variant="body2" color="textPrimary">
					{ __(
						"You're about to stop syncing a typography class to Version 3. Note that if it's being used anywhere on your site, it will inherit a default font.",
						'elementor'
					) }
				</DialogContentText>
			</DialogContent>
			<Divider />
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
					label={ <Typography variant="body2">{ __( "Don't show this again", 'elementor' ) }</Typography> }
				/>
				<div>
					<Button color="secondary" onClick={ closeDialog }>
						{ __( 'Cancel', 'elementor' ) }
					</Button>
					<Button variant="contained" color="secondary" onClick={ handleConfirm } sx={ { ml: 1 } }>
						{ __( 'Got it', 'elementor' ) }
					</Button>
				</div>
			</DialogActions>
		</Dialog>
	);
};
