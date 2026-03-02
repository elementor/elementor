import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	Card,
	CardActionArea,
	CardContent,
	CardMedia,
	CloseButton,
	Paper,
	Slide,
	Stack,
	type Theme,
	Typography,
} from '@elementor/ui';

import type { StarterConfig } from '../types';
import { deleteStarterConfig, getAssetUrl, getEditingPanelWidth, getStarterConfig, getTopBarHeight } from '../utils';

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
	const apiFetch = ( window as unknown as { wp?: { apiFetch?: ( args: object ) => Promise< unknown > } } ).wp
		?.apiFetch;

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
		<Slide direction="down" in={ ! isDismissing } mountOnEnter unmountOnExit onExited={ () => setConfig( null ) }>
			<Paper
				elevation={ 4 }
				sx={ {
					position: 'fixed',
					insetBlockStart: topOffset + 'px',
					insetInlineStart: panelWidth + 'px',
					insetInlineEnd: 0,
					zIndex: 10000,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 3,
					py: 3,
					pb: 4,
					px: 2.5,
					backgroundColor: '#f9f9fb',
				} }
			>
				<CloseButton
					onClick={ dismiss }
					aria-label="Close"
					sx={ ( theme: Theme ) => ( {
						position: 'absolute',
						insetBlockStart: theme.spacing( 2 ),
						insetInlineEnd: theme.spacing( 2 ),
					} ) }
				/>

				<Typography
					variant="h5"
					sx={ {
						fontFamily: 'Poppins, sans-serif',
						fontWeight: 500,
						color: 'text.primary',
					} }
				>
					Start building.
				</Typography>

				<Stack direction="row" spacing={ 3 } justifyContent="center">
					<Card sx={ { width: 280 } }>
						<CardActionArea onClick={ onAiPlannerClick }>
							<CardMedia
								component="img"
								image={ getAssetUrl( 'ai-site-planner.png' ) }
								alt="AI Site Planner"
								sx={ {
									height: 138,
									p: 1.5,
									boxSizing: 'border-box',
									objectFit: 'cover',
									borderRadius: 1,
								} }
							/>
							<CardContent sx={ { textAlign: 'center' } }>
								<Typography variant="subtitle1" color="text.primary">
									AI Site Planner
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={ { mt: 1 } }>
									Generate your wireframe with AI
								</Typography>
							</CardContent>
						</CardActionArea>
					</Card>

					<Card sx={ { width: 280 } }>
						<CardActionArea onClick={ onTemplatesClick }>
							<CardMedia
								component="img"
								image={ getAssetUrl( 'website-templates.png' ) }
								alt="Website templates"
								sx={ {
									height: 138,
									p: 1.5,
									boxSizing: 'border-box',
									objectFit: 'cover',
									borderRadius: 1,
								} }
							/>
							<CardContent sx={ { textAlign: 'center' } }>
								<Typography variant="subtitle1" color="text.primary">
									Website templates
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={ { mt: 1 } }>
									Start with a ready-made design
								</Typography>
							</CardContent>
						</CardActionArea>
					</Card>
				</Stack>
			</Paper>
		</Slide>
	);
}
