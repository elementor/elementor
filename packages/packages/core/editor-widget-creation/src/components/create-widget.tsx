import * as React from 'react';
import { useEffect, useState } from 'react';
import {
	installAngiePlugin,
	isAngieAvailable,
	redirectToAppAdmin,
	redirectToInstallation,
	sendPromptToAngie,
} from '@elementor/editor-mcp';
import { ThemeProvider } from '@elementor/editor-ui';
import { XIcon } from '@elementor/icons';
import { Button, CircularProgress, Dialog, DialogContent, IconButton, Image, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type ShowModalEventDetail = {
	prompt?: string;
};

type InstallState = 'idle' | 'installing' | 'error';

const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';
const PROMOTION_IMAGE_URL = 'https://assets.elementor.com/packages/v1/images/angie-promotion.svg';

export function CreateWidget() {
	const [ open, setOpen ] = useState( false );
	const [ prompt, setPrompt ] = useState< string | undefined >();
	const [ installState, setInstallState ] = useState< InstallState >( 'idle' );

	const handleShow = async ( event: Event ) => {
		const customEvent = event as CustomEvent< ShowModalEventDetail >;

		if ( isAngieAvailable() ) {
			sendPromptToAngie( customEvent.detail?.prompt );

			return;
		}

		setPrompt( customEvent.detail?.prompt );
		setOpen( true );
	};

	const handleClose = () => {
		if ( installState === 'installing' ) {
			return;
		}

		setOpen( false );
		setPrompt( undefined );
		setInstallState( 'idle' );
	};

	const handleInstall = async () => {
		if ( ! prompt ) {
			return;
		}

		setInstallState( 'installing' );

		const result = await installAngiePlugin();

		if ( ! result.success ) {
			setInstallState( 'error' );

			return;
		}

		redirectToAppAdmin( prompt );
	};

	const handleFallbackInstall = () => {
		if ( ! prompt ) {
			return;
		}

		redirectToInstallation( prompt );
	};

	useEffect( () => {
		window.addEventListener( CREATE_WIDGET_EVENT, handleShow );

		return () => {
			window.removeEventListener( CREATE_WIDGET_EVENT, handleShow );
		};
	}, [] );

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
							src={ PROMOTION_IMAGE_URL }
						/>
						<Stack gap={ 2 } justifyContent="center" p={ 4 }>
							<Typography variant="h6" fontWeight={ 600 } whiteSpace="nowrap">
								{ installState === 'error'
									? __( 'Installation failed', 'elementor' )
									: __( 'Install Angie to build custom widgets', 'elementor' ) }
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{ installState === 'error'
									? __(
											"We couldn't install Angie automatically. Click below to install it manually.",
											'elementor'
									  )
									: __(
											'Angie lets you generate custom widgets, sections, and code using simple instructions.',
											'elementor'
									  ) }
							</Typography>
							{ installState !== 'error' && (
								<Typography variant="body2" color="text.secondary">
									{ __( 'Install once to start building directly inside the editor.', 'elementor' ) }
								</Typography>
							) }
							<Stack direction="row" justifyContent="flex-end" sx={ { mt: 2 } }>
								{ installState === 'error' ? (
									<Button variant="contained" color="accent" onClick={ handleFallbackInstall }>
										{ __( 'Install Manually', 'elementor' ) }
									</Button>
								) : (
									<Button
										variant="contained"
										color="accent"
										onClick={ handleInstall }
										disabled={ installState === 'installing' }
										startIcon={
											installState === 'installing' ? (
												<CircularProgress size={ 18 } color="inherit" />
											) : undefined
										}
									>
										{ installState === 'installing'
											? __( 'Installing…', 'elementor' )
											: __( 'Install Angie', 'elementor' ) }
									</Button>
								) }
							</Stack>
						</Stack>
					</Stack>
				</DialogContent>
			</Dialog>
		</ThemeProvider>
	);
}
