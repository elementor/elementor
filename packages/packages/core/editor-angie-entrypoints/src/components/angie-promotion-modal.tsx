import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { setReferrerRedirect } from '@elementor/angie-sdk';
import { ThemeProvider } from '@elementor/editor-ui';
import { XIcon } from '@elementor/icons';
import { Box, Button, Dialog, DialogContent, IconButton, Image, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const SHOW_ANGIE_PROMOTION_MODAL_EVENT = 'elementor/editor/show-angie-promotion-modal';

const ANGIE_INSTALL_URL = '/wp-admin/plugin-install.php?s=angie&tab=search&type=term';
const ANGIE_PROMOTION_IMAGE_URL = 'https://assets.elementor.com/packages/v1/images/angie-promotion.svg';

type ShowModalEventDetail = {
	prompt?: string;
};

export function AngiePromotionModal() {
	const [ open, setOpen ] = useState( false );
	const [ prompt, setPrompt ] = useState< string | undefined >();

	useEffect( () => {
		const handleShow = ( event: CustomEvent< ShowModalEventDetail > ) => {
			setPrompt( event.detail?.prompt );
			setOpen( true );
		};

		window.addEventListener( SHOW_ANGIE_PROMOTION_MODAL_EVENT, handleShow as EventListener );

		return () => {
			window.removeEventListener( SHOW_ANGIE_PROMOTION_MODAL_EVENT, handleShow as EventListener );
		};
	}, [] );

	const handleClose = useCallback( () => {
		setOpen( false );
		setPrompt( undefined );
	}, [] );

	const handleInstall = useCallback( () => {
		const success = setReferrerRedirect( window.location.href, prompt );

		if ( ! success ) {
			return;
		}

		window.location.href = ANGIE_INSTALL_URL;
	}, [ prompt ] );

	return (
		<ThemeProvider>
			<Dialog minWidth="md" open={ open } onClose={ handleClose }>
				<IconButton
					aria-label={ __( 'Close', 'elementor' ) }
					onClick={ handleClose }
					sx={ {
						position: 'absolute',
						right: 8,
						top: 8,
						zIndex: 1,
					} }
				>
					<XIcon />
				</IconButton>
				<DialogContent sx={ { p: 0, overflow: 'hidden' } }>
					<Stack direction="row" alignItems="stretch">
						<Box
							sx={ {
								flex: 1,
								minWidth: 0,
								overflow: 'hidden',
							} }
						>
							<Image
								sx={ {
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									objectPosition: 'right center',
								} }
								src={ 'https://assets.elementor.com/packages/v1/images/class-manager-intro.svg' }
								alt={ '' }
							/>
						</Box>
						<Box
							sx={ {
								flexShrink: 0,
								width: 340,
								p: 4,
							} }
						>
							<Typography variant="h6" fontWeight={ 600 } mb={ 2 }>
								{ __( 'Install Angie to build custom widgets', 'elementor' ) }
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{ __(
									'Angie lets you generate custom widgets, sections, and code using simple instructions.',
									'elementor'
								) }
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{ __( 'Install once to start building directly inside the editor.', 'elementor' ) }
							</Typography>
							<Stack direction="row" justifyContent="flex-end" mt={ 2 }>
								<Button variant="contained" color="accent" onClick={ handleInstall }>
									{ __( 'Install Angie', 'elementor' ) }
								</Button>
							</Stack>
						</Box>
					</Stack>
				</DialogContent>
			</Dialog>
		</ThemeProvider>
	);
}

export function showAngiePromotionModal( prompt?: string ) {
	window.dispatchEvent(
		new CustomEvent< ShowModalEventDetail >( SHOW_ANGIE_PROMOTION_MODAL_EVENT, {
			detail: { prompt },
		} )
	);
}
