import * as React from 'react';
import { useState } from 'react';
import { AlertTriangleFilledIcon } from '@elementor/icons';
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

export const EditConfirmationDialog = ( {
	closeDialog,
	onConfirm,
	onSuppressMessage,
}: {
	closeDialog: () => void;
	onConfirm?: () => void;
	onSuppressMessage?: () => void;
} ) => {
	const [ dontShowAgain, setDontShowAgain ] = useState( false );

	const handleSave = () => {
		if ( dontShowAgain ) {
			onSuppressMessage?.();
		}
		onConfirm?.();
	};

	return (
		<Dialog open onClose={ closeDialog } maxWidth="xs">
			<DialogTitle display="flex" alignItems="center" gap={ 1 }>
				<AlertTriangleFilledIcon color="secondary" />
				{ __( 'Changes to variables go live right away.', 'elementor' ) }
			</DialogTitle>
			<DialogContent>
				<DialogContentText variant="body2" color="textPrimary">
					{ __(
						"Don't worry - all other changes you make will wait until you publish your site.",
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
					label={ <Typography variant="body2">{ __( "Don't show me again", 'elementor' ) }</Typography> }
				/>
				<div>
					<Button color="secondary" onClick={ closeDialog }>
						{ __( 'Keep editing', 'elementor' ) }
					</Button>
					<Button variant="contained" color="secondary" onClick={ handleSave } sx={ { ml: 1 } }>
						{ __( 'Save', 'elementor' ) }
					</Button>
				</div>
			</DialogActions>
		</Dialog>
	);
};
