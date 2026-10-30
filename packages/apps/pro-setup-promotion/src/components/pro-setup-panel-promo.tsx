import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { notify } from '@elementor/editor-notifications';
import { ThemeProvider } from '@elementor/editor-ui';
import { httpService } from '@elementor/http-client';
import { ChevronRightIcon, InfoCircleFilledIcon } from '@elementor/icons';
import {
	Alert,
	AlertTitle,
	Box,
	Button,
	CircularProgress,
	CloseButton,
	Infotip,
	Rotate,
	Stack,
	Typography,
	useTheme,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import {
	trackProSetupPromotionBannerClick,
	trackProSetupPromotionConnectResult,
	trackProSetupPromotionCtaClick,
	trackProSetupPromotionDismiss,
	trackProSetupPromotionImpression,
	trackProSetupPromotionResult,
	type ProSetupPromotionState,
} from '../analytics';
import { useElementorConnectPopup } from '../hooks/use-elementor-connect-popup';
import { getSetupRequestErrorMessage } from '../utils/get-setup-request-error-message';

const POPOVER_WIDTH = 296;
const POPOVER_OFFSET: [ number, number ] = [ -24, 12 ];
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
	const theme = useTheme();
	const placement = 'rtl' === theme.direction ? 'left-start' : 'right-start';
	const isRtl = 'rtl' === theme.direction;

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
				message: __( 'Could not verify your license. Try again.', 'elementor' ),
				id: 'pro-setup-promotion-connect-verify-error',
			} );
			trackProSetupPromotionConnectResult( 'error', __( 'Could not verify license.', 'elementor' ) );
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

	const dismissPermanently = async () => {
		trackProSetupPromotionDismiss( state );
		setDismissed( true );
		setOpen( false );

		try {
			await postDismiss();
		} catch {
			notify( {
				type: 'error',
				message: __( 'Could not save your preference. Try again.', 'elementor' ),
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

			applyPromotionConfig( result.proSetupPromotion );
			setOpen( true );

			if ( result.reload ) {
				window.location.reload();
			}
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
							options: { offset: POPOVER_OFFSET },
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
								sx={ { ml: 'auto', flexShrink: 0 } }
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
							<Button variant="text" size="small" color="secondary" onClick={ dismissPermanently } sx={ { ml: -1 } }>
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
								sx={ { ml: 'auto' } }
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
						icon={ <InfoCircleFilledIcon fontSize="tiny" /> }
						sx={ {
							alignItems: 'center',
							py: 0.75,
							'& .MuiAlert-message': {
								display: 'flex',
								alignItems: 'center',
								gap: 0.5,
								flex: 1,
								minWidth: 0,
								overflow: 'hidden',
							},
						} }
					>
						<Box sx={ { flex: 1, minWidth: 0, overflow: 'hidden' } }>
							<AlertTitle sx={ { mb: 0.25, fontSize: 'inherit', lineHeight: 1.3 } }>
								{ promotionConfig.banner.title }
							</AlertTitle>
							<Typography variant="caption" component="span" color="text.secondary" noWrap display="block">
								{ promotionConfig.banner.description }
							</Typography>
						</Box>
						<Rotate in={ isRtl } sx={ { display: 'flex', flexShrink: 0, alignItems: 'center' } }>
							<ChevronRightIcon fontSize="small" color="action" />
						</Rotate>
					</Alert>
				</Box>
			</SetupInfotip>
		</ThemeProvider>
	);
}
