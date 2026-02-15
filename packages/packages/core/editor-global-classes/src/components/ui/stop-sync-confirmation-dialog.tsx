import * as React from 'react';
import { useState } from 'react';
import { FlippedColorSwatchIcon } from '@elementor/icons';
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
		<Dialog open={ open } onClose={ closeDialog } maxWidth="xs">
			<DialogTitle display="flex" alignItems="center" gap={ 1 }>
				<FlippedColorSwatchIcon color="secondary" />
				{ __( 'Stop syncing global class', 'elementor' ) }
			</DialogTitle>
			<DialogContent>
				<DialogContentText variant="body2" color="textPrimary">
					{ __(
						'This will disconnect the global class from version 3. Existing uses on your site will automatically switch to a default class.',
						'elementor'
					) }
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

