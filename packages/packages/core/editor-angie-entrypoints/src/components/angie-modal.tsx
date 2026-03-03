import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { getAngieIframe, setReferrerRedirect, toggleAngieSidebar } from '@elementor/angie-sdk';
import { ThemeProvider } from '@elementor/editor-ui';
import { XIcon } from '@elementor/icons';
import { Button, Dialog, DialogContent, IconButton, Image, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ANGIE_INSTALL_URL, ANGIE_PROMOTION_IMAGE_URL, SHOW_ANGIE_MODAL_EVENT } from '../consts';
import { isAngieActive } from '../utils/is-angie-active';

type ShowModalEventDetail = {
	prompt?: string;
};

export function AngieModal() {
	const [ open, setOpen ] = useState( false );
	const [ prompt, setPrompt ] = useState< string | undefined >();

	useEffect( () => {
		const handleShow = async ( event: CustomEvent< ShowModalEventDetail > ) => {
			const isActive = await isAngieActive();

			if ( isActive ) {
				const iframe = getAngieIframe();
				if ( iframe ) {
					toggleAngieSidebar( iframe, true );
					if ( event.detail?.prompt ) {
						window.location.hash = 'angie-prompt=' + encodeURIComponent( event.detail.prompt );
					}
				}
				return;
			}

			setPrompt( event.detail?.prompt );
			setOpen( true );
		};

		window.addEventListener( SHOW_ANGIE_MODAL_EVENT, handleShow as unknown as EventListener );

		return () => {
			window.removeEventListener( SHOW_ANGIE_MODAL_EVENT, handleShow as unknown as EventListener );
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
			<Dialog fullWidth maxWidth="md" open={ open } onClose={ handleClose }>
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
					<Stack direction="row" sx={ { height: 400 } }>
						<Image
							sx={ {
								height: '100%',
								aspectRatio: '1 / 1',
								objectFit: 'cover',
								objectPosition: 'right center',
							} }
							src={ ANGIE_PROMOTION_IMAGE_URL }
						/>
						<Stack gap={ 2 } justifyContent="center" p={ 4 }>
							<Typography variant="h6" fontWeight={ 600 } whiteSpace="nowrap">
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
							<Stack direction="row" justifyContent="flex-end" sx={ { mt: 1 } }>
								<Button variant="contained" color="accent" onClick={ handleInstall }>
									{ __( 'Install Angie', 'elementor' ) }
								</Button>
							</Stack>
						</Stack>
					</Stack>
				</DialogContent>
			</Dialog>
		</ThemeProvider>
	);
}

export async function showAngiePromotionModal( prompt?: string ) {
	window.dispatchEvent(
		new CustomEvent< ShowModalEventDetail >( SHOW_ANGIE_MODAL_EVENT, {
			detail: { prompt },
		} )
	);
}
