import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, Typography, styled } from '@elementor/ui';

import { getStarterConfig, deleteStarterConfig, getAssetUrl, getEditingPanelWidth, getTopBarHeight } from '../utils';
import type { StarterConfig } from '../types';

const TRANSITION_DURATION = 350;

const Overlay = styled( Box )( {
	position: 'fixed',
	right: 0,
	zIndex: 10000,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: '24px',
	padding: '24px 20px 32px',
	backgroundColor: '#f9f9fb',
	boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
	transform: 'translateY(0)',
	opacity: 1,
	transition: `transform ${ TRANSITION_DURATION }ms ease-in-out, opacity ${ TRANSITION_DURATION }ms ease-in-out`,
} );

const CloseButton = styled( IconButton )( {
	position: 'absolute',
	top: '16px',
	right: '16px',
	padding: '4px',
	borderRadius: '50%',
	backgroundColor: 'transparent',
	fontSize: '18px',
	lineHeight: 1,
	color: '#0c0d0e',
	'&:hover, &:focus': {
		backgroundColor: 'rgba(0, 0, 0, 0.05)',
		color: '#0c0d0e',
	},
} );

const Title = styled( Typography )( {
	fontFamily: 'Poppins, sans-serif',
	fontSize: '24px',
	fontWeight: 500,
	lineHeight: '32px',
	color: '#0c0d0e',
} );

const CardsContainer = styled( Box )( {
	display: 'flex',
	gap: '24px',
	justifyContent: 'center',
} );

const Card = styled( 'button' )( {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	width: '280px',
	borderRadius: '12px',
	backgroundColor: '#fff',
	overflow: 'hidden',
	cursor: 'pointer',
	padding: 0,
	margin: 0,
	boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
	transition: 'box-shadow 0.2s ease',
	border: 'none',
	'&:hover, &:focus': {
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
	},
} );

const CardIllustration = styled( Box )( {
	width: '100%',
	height: '138px',
	overflow: 'hidden',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: '12px',
	boxSizing: 'border-box',
	'& img': {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		borderRadius: '8px',
	},
} );

const CardLabel = styled( Typography )( {
	fontSize: '16px',
	fontWeight: 500,
	lineHeight: '18px',
	letterSpacing: '0.15px',
	color: '#0c0d0e',
	marginTop: '4px',
} );

const CardSubtitle = styled( Typography )( {
	fontSize: '14px',
	fontWeight: 400,
	lineHeight: '20px',
	letterSpacing: '0.15px',
	color: '#3f444b',
	marginTop: '8px',
	marginBottom: '24px',
} );

interface ElementorChannels {
	panelElements?: {
		on: ( event: string, callback: () => void ) => void;
		off: ( event: string, callback: () => void ) => void;
	};
}

function getElementorChannels(): ElementorChannels | undefined {
	return ( window as unknown as { elementor?: { channels?: ElementorChannels } } ).elementor?.channels;
}

function dismissStarterApi( config: StarterConfig ) {
	const apiFetch = ( window as unknown as { wp?: { apiFetch?: ( args: object ) => Promise< unknown > } } ).wp?.apiFetch;

	apiFetch?.( {
		path: config.restPath,
		method: 'POST',
		data: { starter_dismissed: true },
	} );
}

export default function StarterOverlay() {
	const [ config, setConfig ] = useState< StarterConfig | null >( null );
	const [ isDismissing, setIsDismissing ] = useState( false );
	const [ panelWidth, setPanelWidth ] = useState( 0 );
	const [ topOffset, setTopOffset ] = useState( 0 );
	const dismissedRef = useRef( false );

	useEffect( () => {
		const activate = () => {
			const cfg = getStarterConfig();

			if ( cfg ) {
				setConfig( cfg );
				setPanelWidth( getEditingPanelWidth() );
				setTopOffset( getTopBarHeight() );
			}
		};

		const onCommandAfter = ( e: Event ) => {
			const detail = ( e as CustomEvent )?.detail;

			if ( detail?.command === 'editor/documents/attach-preview' ) {
				activate();
			}
		};

		window.addEventListener( 'elementor/commands/run/after', onCommandAfter );

		return () => window.removeEventListener( 'elementor/commands/run/after', onCommandAfter );
	}, [] );

	const dismiss = useCallback( () => {
		if ( ! config || dismissedRef.current ) {
			return;
		}

		dismissedRef.current = true;
		setIsDismissing( true );

		dismissStarterApi( config );
		deleteStarterConfig();

		setTimeout( () => {
			setConfig( null );
		}, TRANSITION_DURATION );
	}, [ config ] );

	useEffect( () => {
		if ( ! config ) {
			return;
		}

		const channels = getElementorChannels();

		if ( ! channels?.panelElements ) {
			return;
		}

		const handleDragStart = () => dismiss();

		channels.panelElements.on( 'element:drag:start', handleDragStart );

		return () => {
			channels.panelElements?.off( 'element:drag:start', handleDragStart );
		};
	}, [ config, dismiss ] );

	useEffect( () => {
		if ( ! config ) {
			return;
		}

		const updateWidth = () => setPanelWidth( getEditingPanelWidth() );
		const observer = new MutationObserver( updateWidth );
		const panel = document.querySelector( '.elementor-panel' );

		if ( panel ) {
			observer.observe( panel, { attributes: true, attributeFilter: [ 'style' ] } );
		}

		window.addEventListener( 'resize', updateWidth );
		updateWidth();

		return () => {
			observer.disconnect();
			window.removeEventListener( 'resize', updateWidth );
		};
	}, [ config ] );

	if ( ! config ) {
		return null;
	}

	const onAiPlannerClick = () => {
		dismiss();

		if ( config.aiPlannerUrl ) {
			window.open( config.aiPlannerUrl, '_blank', 'noopener,noreferrer' );
		}
	};

	const onTemplatesClick = () => {
		dismiss();

		const $e = ( window as unknown as { $e?: { run: ( cmd: string, args?: object ) => void } } ).$e;
		$e?.run( 'library/open' );
	};

	return (
		<Overlay
			sx={ {
				top: topOffset + 'px',
				left: panelWidth + 'px',
				...( isDismissing && {
					transform: 'translateY(-100%)',
					opacity: 0,
				} ),
			} }
		>
			<CloseButton onClick={ dismiss } aria-label="Close">
				<i className="eicon-close" aria-hidden="true" />
			</CloseButton>

			<Title>Start building.</Title>

			<CardsContainer>
				<Card type="button" onClick={ onAiPlannerClick }>
					<CardIllustration>
						<img
							src={ getAssetUrl( 'ai-site-planner.png' ) }
							alt="AI Site Planner"
						/>
					</CardIllustration>
					<CardLabel>AI Site Planner</CardLabel>
					<CardSubtitle>Generate your wireframe with AI</CardSubtitle>
				</Card>

				<Card type="button" onClick={ onTemplatesClick }>
					<CardIllustration>
						<img
							src={ getAssetUrl( 'website-templates.png' ) }
							alt="Website templates"
						/>
					</CardIllustration>
					<CardLabel>Website templates</CardLabel>
					<CardSubtitle>Start with a ready-made design</CardSubtitle>
				</Card>
			</CardsContainer>
		</Overlay>
	);
}
