import * as React from 'react';
import { useEffect, useState } from 'react';
import { isAngieAvailable, saveAngieConsent, sendPromptToAngie } from '@elementor/editor-mcp';
import { ThemeProvider } from '@elementor/editor-ui';
import { trackEvent } from '@elementor/events';
import { XIcon } from '@elementor/icons';
import {
	Button,
	Checkbox,
	Dialog,
	DialogContent,
	FormControlLabel,
	IconButton,
	Image,
	Stack,
	Typography,
} from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { interpolateLinks } from '../interpolate-links';

type ShowModalEventDetail = {
	prompt?: string;
	entry_point: string;
};

type CreateWidgetModalProps = {
	entryPoint: string;
	onClose: () => void;
};

const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';
const ANGIE_MODAL_PROMOTION_IMAGE_URL =
	'https://assets.elementor.com/packages/v1/images/angie-top-bar-promotion-modal-0926.png';
const ANGIE_CTA_CLICKED_EVENT = 'ai_widget_cta_clicked' as const;
const ANGIE_INSTALL_ABANDONED_EVENT = 'angie_install_abandoned' as const;

function CreateWidgetModal( { entryPoint, onClose }: CreateWidgetModalProps ) {
	const [ agreedToTerms, setAgreedToTerms ] = useState( false );
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const handleClose = () => {
		if ( isSubmitting ) {
			return;
		}

		trackEvent( {
			eventName: ANGIE_INSTALL_ABANDONED_EVENT,
			abandon_step: 'install_modal',
			trigger_source: entryPoint,
		} );

		onClose();
	};

	const handleContinue = async () => {
		setIsSubmitting( true );

		try {
			await saveAngieConsent();
			onClose();
		} catch {
		} finally {
			setIsSubmitting( false );
		}
	};

	return (
		<ThemeProvider>
			<Dialog fullWidth maxWidth="md" open onClose={ handleClose }>
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
							src={ ANGIE_MODAL_PROMOTION_IMAGE_URL }
						/>
						<Stack justifyContent="space-between" p={ 4 }>
							<Stack gap={ 2.5 } justifyContent="center" sx={ { flex: 1, paddingInlineEnd: 2.5 } }>
								<Typography variant="h4" fontWeight={ 600 } color="text.secondary">
									{ __( 'Pages, layouts,', 'elementor' ) }
									<br />
									{ __( 'widgets and more', 'elementor' ) }
								</Typography>
								<Typography variant="body2" fontWeight={ 500 }>
									{ __(
										'Ask Angie to build pages, layouts, widgets, and more directly in Elementor.',
										'elementor'
									) }
								</Typography>
								<FormControlLabel
									control={
										<Checkbox
											size="small"
											checked={ agreedToTerms }
											onChange={ (
												_e: React.ChangeEvent< HTMLInputElement >,
												checked: boolean
											) => setAgreedToTerms( checked ) }
										/>
									}
									label={
										<Typography variant="body2" color="text.secondary">
											{ interpolateLinks(
												sprintf(
													// translators: %1$s is the Terms link, %2$s is the Privacy Policy link.
													__( 'By continuing, you agree to our %1$s & %2$s.', 'elementor' ),
													'{{terms}}',
													'{{privacy}}'
												),
												{
													terms: {
														label: __( 'Terms', 'elementor' ),
														href: 'https://elementor.com/terms/angie-terms-conditions/',
													},
													privacy: {
														label: __( 'Privacy Policy', 'elementor' ),
														href: 'https://elementor.com/about/privacy/',
													},
												}
											) }
										</Typography>
									}
								/>
							</Stack>
							<Stack direction="row" justifyContent="flex-end">
								<Button
									variant="contained"
									color="accent"
									onClick={ handleContinue }
									disabled={ isSubmitting || ! agreedToTerms }
								>
									{ __( 'Continue', 'elementor' ) }
								</Button>
							</Stack>
						</Stack>
					</Stack>
				</DialogContent>
			</Dialog>
		</ThemeProvider>
	);
}

export function CreateWidget() {
	const [ modalData, setModalData ] = useState< ShowModalEventDetail | null >( null );

	useEffect( () => {
		const handleShow = ( event: Event ) => {
			const customEvent = event as CustomEvent< ShowModalEventDetail >;
			const hasAngieInstalled = isAngieAvailable();

			trackEvent( {
				eventName: ANGIE_CTA_CLICKED_EVENT,
				entry_point: customEvent.detail.entry_point,
				has_angie_installed: hasAngieInstalled,
			} );

			if ( hasAngieInstalled ) {
				sendPromptToAngie( customEvent.detail?.prompt );

				return;
			}

			setModalData( customEvent.detail );
		};

		window.addEventListener( CREATE_WIDGET_EVENT, handleShow );

		return () => {
			window.removeEventListener( CREATE_WIDGET_EVENT, handleShow );
		};
	}, [] );

	if ( ! modalData ) {
		return null;
	}

	return <CreateWidgetModal entryPoint={ modalData.entry_point } onClose={ () => setModalData( null ) } />;
}
