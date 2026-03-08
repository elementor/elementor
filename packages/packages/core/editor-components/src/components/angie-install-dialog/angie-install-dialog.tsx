import * as React from 'react';
import { redirectToInstallation } from '@elementor/editor-mcp';
import { XIcon } from '@elementor/icons';
import { Button, Dialog, DialogContent, IconButton, Image, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const PROMOTION_IMAGE_URL = 'https://assets.elementor.com/packages/v1/images/angie-components-promotion.png';

type AngieInstallDialogProps = {
	open: boolean;
	onClose: () => void;
	prompt: string;
};

export function AngieInstallDialog( { open, onClose, prompt }: AngieInstallDialogProps ) {
	const handleInstall = () => {
		redirectToInstallation( prompt );
	};

	return (
		<Dialog fullWidth maxWidth="md" open={ open } onClose={ onClose }>
			<IconButton
				aria-label={ __( 'Close', 'elementor' ) }
				onClick={ onClose }
				sx={ { position: 'absolute', right: 8, top: 8, zIndex: 1 } }
			>
				<XIcon />
			</IconButton>
			<DialogContent sx={ { p: 0, overflow: 'hidden' } }>
				<Stack direction="row" sx={ { height: 400 } }>
					<Image
						sx={ {
							height: '100%',
							aspectRatio: '1 / 1',
							objectFit: 'cover',
							objectPosition: 'right center',
						} }
						src={ PROMOTION_IMAGE_URL }
					/>
					<Stack gap={ 2 } justifyContent="center" p={ 4 }>
						<Typography variant="h6" fontWeight={ 600 } whiteSpace="nowrap">
							{ __( 'Install Angie to build custom components', 'elementor' ) }
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{ __(
								'Angie lets you generate custom components using simple instructions.',
								'elementor'
							) }
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{ __( 'Install once to start building directly inside the editor.', 'elementor' ) }
						</Typography>
						<Stack direction="row" justifyContent="flex-end" sx={ { mt: 2 } }>
							<Button variant="contained" color="accent" onClick={ handleInstall }>
								{ __( 'Install Angie', 'elementor' ) }
							</Button>
						</Stack>
					</Stack>
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
