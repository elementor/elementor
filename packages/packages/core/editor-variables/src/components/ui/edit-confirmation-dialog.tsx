import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSuppressedMessage } from '@elementor/editor-current-user';
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

const MESSAGE_KEY = 'edit-confirmation-dialog';
const TITLE_ID = 'edit-confirmation-dialog';

export const EditConfirmationDialog = ( {
	closeDialog,
	onConfirm,
}: {
	closeDialog: () => void;
	onConfirm?: () => void;
} ) => {
	const [ isMessageSuppressed, suppressMessage ] = useSuppressedMessage( MESSAGE_KEY );
	const [ dontShowAgain, setDontShowAgain ] = useState( false );

	useEffect( () => {
		if ( isMessageSuppressed ) {
			onConfirm?.();
		}
	}, [ isMessageSuppressed, onConfirm ] );

	const handleSave = () => {
		if ( dontShowAgain ) {
			suppressMessage();
		}
		onConfirm?.();
	};

	if ( isMessageSuppressed ) {
		return null;
	}

	return (
		<Dialog open onClose={ closeDialog } aria-labelledby={ TITLE_ID } maxWidth="xs">
			<DialogTitle id={ TITLE_ID } display="flex" alignItems="center" gap={ 1 }>
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
