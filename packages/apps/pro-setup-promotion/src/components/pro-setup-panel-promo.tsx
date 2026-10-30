import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { notify } from '@elementor/editor-notifications';
import { ThemeProvider } from '@elementor/editor-ui';
import { httpService } from '@elementor/http-client';
import { DownloadIcon } from '@elementor/icons';
import {
	Alert,
	AlertTitle,
	Box,
	Button,
	CircularProgress,
	CloseButton,
	DirectionProvider,
	Infotip,
	Stack,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import {
	type ProSetupPromotionState,
	trackProSetupPromotionBannerClick,
	trackProSetupPromotionConnectResult,
	trackProSetupPromotionCtaClick,
	trackProSetupPromotionDismiss,
	trackProSetupPromotionImpression,
	trackProSetupPromotionResult,
} from '../analytics';
import { useElementorConnectPopup } from '../hooks/use-elementor-connect-popup';
import { getSetupRequestErrorMessage } from '../utils/get-setup-request-error-message';
import { markConnectSuccessNotificationForAfterReload } from '../utils/post-reload-connect-success-notification';

const POPOVER_WIDTH = 296;
const POPOVER_OFFSET_LTR: [ number, number ] = [ -24, 12 ];
const POPOVER_OFFSET_RTL: [ number, number ] = [ 24, 12 ];
/** Keeps popover height stable when copy is shorter (e.g. connect vs install). */
const POPOVER_DESCRIPTION_MIN_HEIGHT = 72;
const POPOVER_HEADER_MIN_HEIGHT = 48;
const REST_BASE = 'elementor/v1/pro-setup-promotion';

type InfotipWithPopperProps = React.ComponentProps< typeof Infotip > & {
	PopperProps?: {
		modifiers?: Array< { name: string; options?: { offset: [ number, number ] } } >;
	};
};

const SetupInfotip = Infotip as React.FC< InfotipWithPopperProps >;

type PreviewWindow = Window & {
	elementor?: {
		$preview?: ArrayLike< { contentDocument?: Document | null } >;
	};
};

type ProSetupConfig = {
	state: ProSetupPromotionState;
	dismissId: string;
	banner: { title: string; description: string };
	popover: { title: string; description: string; ctaLabel: string };
	connectUrl: string;
};

function getConfig(): ProSetupConfig | null {
	const config = window.elementor?.config?.proSetupPromotion;
	if ( ! config?.state ) {
		return null;
	}

	return config as ProSetupConfig;
}

const isEventInside = ( target: EventTarget | null, anchor: HTMLElement | null ) => {
	if ( ! ( target instanceof Element ) ) {
		return false;
	}

	return !! anchor?.contains( target ) || !! target.closest( '[data-pro-setup-popover], .MuiTooltip-popper' );
};

function isEditorRtl(): boolean {
	return 'rtl' === document.dir;
}

function getPopoverPlacement( isRtl: boolean ) {
	return isRtl ? 'left-start' : 'right-start';
}

function getPopoverOffset( isRtl: boolean ): [ number, number ] {
	return isRtl ? POPOVER_OFFSET_RTL : POPOVER_OFFSET_LTR;
}

async function postDismiss(): Promise< void > {
	await httpService().post( `${ REST_BASE }/dismiss` );
}

async function postCompleteSetup(): Promise< CompleteSetupResult > {
	const response = await httpService().post( `${ REST_BASE }/complete-setup` );
	return response.data?.data ?? {};
}

async function fetchPromotionConfig(): Promise< ProSetupConfig | null > {
	const response = await httpService().get( `${ REST_BASE }/setup-state` );
	const config = response.data?.data?.proSetupPromotion;

	if ( ! config?.state ) {
		return null;
	}

	return config as ProSetupConfig;
}

type CompleteSetupResult = {
	reload?: boolean;
	proSetupPromotion?: ProSetupConfig | null;
};

function syncWindowPromotionConfig( config: ProSetupConfig | null ): void {
	if ( ! window.elementor?.config ) {
		return;
	}

	if ( config ) {
		window.elementor.config.proSetupPromotion = config;
		return;
	}

	delete window.elementor.config.proSetupPromotion;
}

export function ProSetupPanelPromo() {
	const [ promotionConfig, setPromotionConfig ] = useState< ProSetupConfig | null >( () => getConfig() );
	const [ dismissed, setDismissed ] = useState( false );
	const [ open, setOpen ] = useState( false );
	const [ isProcessing, setIsProcessing ] = useState( false );
	const anchorRef = useRef< HTMLDivElement >( null );
	const isProcessingRef = useRef( false );
	const isRtl = isEditorRtl();
	const placement = getPopoverPlacement( isRtl );
	const popoverOffset = getPopoverOffset( isRtl );

	const state = promotionConfig?.state as ProSetupPromotionState | undefined;

	const applyPromotionConfig = ( next: ProSetupConfig | null | undefined ) => {
		if ( undefined === next ) {
			return;
		}

		syncWindowPromotionConfig( next );
		setPromotionConfig( next );

		if ( ! next ) {
			setDismissed( true );
			setOpen( false );
		}
	};

	const handleConnectSuccess = async () => {
		try {
			const config = await fetchPromotionConfig();

			if ( ! config ) {
				applyPromotionConfig( null );
				trackProSetupPromotionConnectResult( 'success' );
				markConnectSuccessNotificationForAfterReload();
				window.location.reload();
				return;
			}

			if ( 'connect' === config.state ) {
				applyPromotionConfig( config );
				setOpen( true );
				trackProSetupPromotionConnectResult(
					'error',
					__( 'License was not activated on this site.', 'elementor' )
				);
				notify( {
					type: 'error',
					message: __(
						'Your Pro license is not active yet. Finish activation in the connect window, then try again.',
						'elementor'
					),
					id: 'pro-setup-promotion-connect-incomplete',
				} );
				return;
			}

			applyPromotionConfig( config );
			trackProSetupPromotionConnectResult( 'success' );
		} catch {
			notify( {
				type: 'error',
				message: __( "We couldn't confirm your Pro license. Please try again.", 'elementor' ),
				id: 'pro-setup-promotion-connect-verify-error',
			} );
			trackProSetupPromotionConnectResult(
				'error',
				__( "We couldn't confirm your Pro license. Please try again.", 'elementor' )
			);
		} finally {
			isProcessingRef.current = false;
			setIsProcessing( false );
		}
	};

	const handleConnectError = () => {
		isProcessingRef.current = false;
		setIsProcessing( false );
		trackProSetupPromotionConnectResult( 'error', __( 'Connect window closed.', 'elementor' ) );
	};

	const openConnectPopup = useElementorConnectPopup( {
		connectUrl: promotionConfig?.connectUrl ?? '',
		onSuccess: handleConnectSuccess,
		onError: handleConnectError,
	} );

	useEffect( () => {
		if ( ! state ) {
			return;
		}

		trackProSetupPromotionImpression( state );
	}, [ state ] );

	useEffect( () => {
		if ( ! open ) {
			return undefined;
		}

		const closeOnPointerDown = ( event: Event ) => {
			if ( isProcessingRef.current ) {
				return;
			}

			if ( isEventInside( event.target, anchorRef.current ) ) {
				return;
			}

			setOpen( false );
		};

		const closeOnEscape = ( event: KeyboardEvent ) => {
			if ( 'Escape' !== event.key ) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();

			if ( 'keydown' === event.type ) {
				setOpen( false );
			}
		};

		const iframeDocument = ( window as PreviewWindow ).elementor?.$preview?.[ 0 ]?.contentDocument;

		document.addEventListener( 'mousedown', closeOnPointerDown, true );
		document.addEventListener( 'keydown', closeOnEscape, true );
		document.addEventListener( 'keyup', closeOnEscape, true );
		iframeDocument?.addEventListener( 'mousedown', closeOnPointerDown, true );
		iframeDocument?.addEventListener( 'keydown', closeOnEscape, true );
		iframeDocument?.addEventListener( 'keyup', closeOnEscape, true );

		return () => {
			document.removeEventListener( 'mousedown', closeOnPointerDown, true );
			document.removeEventListener( 'keydown', closeOnEscape, true );
			document.removeEventListener( 'keyup', closeOnEscape, true );
			iframeDocument?.removeEventListener( 'mousedown', closeOnPointerDown, true );
			iframeDocument?.removeEventListener( 'keydown', closeOnEscape, true );
			iframeDocument?.removeEventListener( 'keyup', closeOnEscape, true );
		};
	}, [ open ] );

	if ( dismissed || ! promotionConfig || ! state ) {
		return null;
	}

	const dismissForCooldownPeriod = async () => {
		trackProSetupPromotionDismiss( state );
		setDismissed( true );
		setOpen( false );

		try {
			await postDismiss();
		} catch {
			notify( {
				type: 'error',
				message: __( "Couldn't dismiss this reminder. Please try again.", 'elementor' ),
				id: 'pro-setup-promotion-dismiss-error',
			} );
			setDismissed( false );
		}
	};

	const runServerSetup = async () => {
		setIsProcessing( true );
		isProcessingRef.current = true;
		trackProSetupPromotionCtaClick( state );

		try {
			const result = await postCompleteSetup();
			const action = state === 'install' ? 'install' : 'activate';

			trackProSetupPromotionResult( state, 'success', action );

			applyPromotionConfig( result.proSetupPromotion ?? null );
			setOpen( true );
		} catch ( error ) {
			const message = getSetupRequestErrorMessage( error );

			trackProSetupPromotionResult( state, 'error', state === 'install' ? 'install' : 'activate', message );

			notify( {
				type: 'error',
				message,
				id: 'pro-setup-promotion-setup-error',
			} );
		} finally {
			isProcessingRef.current = false;
			setIsProcessing( false );
		}
	};

	const onPrimaryClick = () => {
		if ( 'connect' === state ) {
			trackProSetupPromotionCtaClick( state );
			isProcessingRef.current = true;
			setIsProcessing( true );
			openConnectPopup();
			return;
		}

		runServerSetup();
	};

	const openPopover = () => {
		trackProSetupPromotionBannerClick( state );
		setOpen( true );
	};

	return (
		<DirectionProvider rtl={ isRtl }>
			<ThemeProvider>
				<SetupInfotip
					arrow
					disableFocusListener
					disableHoverListener
					disableTouchListener
					open={ open }
					placement={ placement }
					PopperProps={ {
						modifiers: [
							{
								name: 'offset',
								options: { offset: popoverOffset },
							},
						],
					} }
					content={
						<Box className="dialog-widget" data-pro-setup-popover="" sx={ { width: POPOVER_WIDTH } }>
							<Stack
								direction="row"
								alignItems="center"
								gap={ 1 }
								py={ 1 }
								px={ 2 }
								sx={ { minHeight: POPOVER_HEADER_MIN_HEIGHT } }
							>
								<Typography variant="subtitle2" sx={ { flex: 1, minWidth: 0 } }>
									{ promotionConfig.popover.title }
								</Typography>
								<CloseButton
									edge="end"
									sx={ { marginInlineStart: 'auto', flexShrink: 0 } }
									slotProps={ { icon: { fontSize: 'small' } } }
									onClick={ () => setOpen( false ) }
								/>
							</Stack>
							<Stack px={ 2 } sx={ { minHeight: POPOVER_DESCRIPTION_MIN_HEIGHT } }>
								<Typography variant="body2" color="secondary" sx={ { pt: 0.5, pb: 1 } }>
									{ promotionConfig.popover.description }
								</Typography>
							</Stack>
							<Stack direction="row" alignItems="center" pt={ 1 } pb={ 1.5 } px={ 2 }>
								<Button
									variant="text"
									size="small"
									color="secondary"
									onClick={ dismissForCooldownPeriod }
									sx={ { marginInlineStart: -1 } }
								>
									{ __( 'Dismiss', 'elementor' ) }
								</Button>
								<Button
									variant="contained"
									size="small"
									color="info"
									disabled={ isProcessing }
									onClick={ ( event: React.MouseEvent ) => {
										event.stopPropagation();
										onPrimaryClick();
									} }
									sx={ { marginInlineStart: 'auto' } }
								>
									{ isProcessing ? (
										<CircularProgress size={ 16 } color="inherit" />
									) : (
										promotionConfig.popover.ctaLabel
									) }
								</Button>
							</Stack>
						</Box>
					}
				>
					<Box
						ref={ anchorRef }
						role="button"
						tabIndex={ 0 }
						aria-expanded={ open }
						onClick={ openPopover }
						onKeyDown={ ( event: React.KeyboardEvent ) => {
							if ( 'Enter' === event.key || ' ' === event.key ) {
								event.preventDefault();
								openPopover();
							}
						} }
						sx={ {
							mx: 1.5,
							my: 1,
							cursor: 'pointer',
							'&:hover': { '& .MuiAlert-root': { filter: 'brightness(0.98)' } },
							'&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
						} }
					>
						<Alert
							variant="standard"
							color="info"
							size="small"
							icon={
								<DownloadIcon
									aria-hidden
									sx={ {
										display: 'block',
										fontSize: 20,
										width: 20,
										height: 20,
										color: 'text.secondary',
									} }
								/>
							}
							sx={ {
								alignItems: 'flex-start',
								py: 0.75,
								'& .MuiAlert-icon': {
									alignSelf: 'flex-start',
									opacity: 1,
									pt: 0.375,
									pb: 0.125,
									marginTop: 0,
									marginBottom: 0,
									marginInlineEnd: 0.5,
								},
								'& .MuiAlert-message': {
									flex: 1,
									minWidth: 0,
									overflow: 'hidden',
									pt: 0.125,
									pb: 0.125,
									marginTop: 0,
									marginBottom: 0,
								},
							} }
						>
							<AlertTitle sx={ { m: 0, mb: 0.25, fontSize: 'inherit', lineHeight: 1.3 } }>
								{ promotionConfig.banner.title }
							</AlertTitle>
							<Typography
								variant="caption"
								component="div"
								color="text.secondary"
								sx={ { lineHeight: 1.35, paddingInlineEnd: 1 } }
							>
								{ promotionConfig.banner.description }
							</Typography>
						</Alert>
					</Box>
				</SetupInfotip>
			</ThemeProvider>
		</DirectionProvider>
	);
}
