import * as React from 'react';
import { useState } from 'react';
import {
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	FormControlLabel,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const IMAGE_URL = 'https://assets.elementor.com/packages/v1/images/class-manager-sync-modal.png';

type StartSyncToV3ModalProps = {
	externalOpen?: boolean;
	onExternalClose?: () => void;
	onConfirm?: () => void;
};

export const StartSyncToV3Modal = ( { externalOpen, onExternalClose, onConfirm }: StartSyncToV3ModalProps = {} ) => {
	const [ shouldShowAgain, setShouldShowAgain ] = useState( true );

	const handleClose = () => {
		onExternalClose?.();
	};

	const handleConfirm = () => {
		onConfirm?.();
		onExternalClose?.();
	};

	return (
		<Dialog open={ !! externalOpen } onClose={ handleClose } maxWidth="sm" fullWidth>
			<DialogContent sx={ { p: 0 } }>
				<Box component="img" src={ IMAGE_URL } alt="" sx={ { width: '100%', display: 'block' } } />
				<Box sx={ { px: 3, pt: 4, pb: 1 } }>
					<Typography variant="h6">{ __( 'Sync class to version 3 Global Fonts', 'elementor' ) }</Typography>
					<Typography variant="body2" color="secondary" sx={ { mb: 2, pt: 1 } }>
						{ __(
							'Only typography settings supported in version 3 will be applied, including: font family, responsive font sizes, weight, text transform, decoration, line height, letter spacing, and word spacing. Changes made in the class will automatically apply to version 3.',
							'elementor'
						) }
					</Typography>
				</Box>
			</DialogContent>
			<DialogActions sx={ { justifyContent: 'space-between', px: 3, pb: 2 } }>
				<FormControlLabel
					control={
						<Checkbox
							checked={ ! shouldShowAgain }
							onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
								setShouldShowAgain( ! e.target.checked )
							}
						/>
					}
					label={
						<Typography variant="body2" color="secondary">
							{ __( "Don't show again", 'elementor' ) }
						</Typography>
					}
				/>
				<Box sx={ { display: 'flex', gap: 1 } }>
					<Button onClick={ handleClose } color="secondary" size="small">
						{ __( 'Cancel', 'elementor' ) }
					</Button>
					<Button onClick={ handleConfirm } variant="contained" size="small">
						{ __( 'Sync to version 3', 'elementor' ) }
					</Button>
				</Box>
			</DialogActions>
		</Dialog>
	);
};
