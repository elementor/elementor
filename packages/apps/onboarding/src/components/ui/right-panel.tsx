import * as React from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Box, styled } from '@elementor/ui';

import { getVideoUrls } from '../../steps/step-visuals';
import type { StepVisualConfig } from '../../types';
import { FOOTER_HEIGHT, LAYOUT_PADDING, TOPBAR_HEIGHT } from './base-layout';

const PANEL_RADIUS_MULTIPLIER = 2;
const PANEL_MIN_HEIGHT = 36;
const VIDEO_TRANSITION_MS = 400;

const ALL_VIDEO_URLS = getVideoUrls();

interface RightPanelRootProps {
	background: string;
}

const RightPanelRoot = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'background',
} )< RightPanelRootProps >( ( { theme, background } ) => {
	const height = `calc(100vh - ${ TOPBAR_HEIGHT }px - ${ FOOTER_HEIGHT }px - ${ theme.spacing(
		LAYOUT_PADDING * 2
	) })`;

	return {
		position: 'relative',
		width: '100%',
		height,
		minHeight: theme.spacing( PANEL_MIN_HEIGHT ),
		borderRadius: theme.shape.borderRadius * PANEL_RADIUS_MULTIPLIER,
		overflow: 'hidden',
		background,
	};
} );

const VideoStack = React.memo( function VideoStack( { activeUrl }: { activeUrl: string | undefined } ) {
	const videoRefs = useRef< Map< string, HTMLVideoElement > >( new Map() );
	const [ readyUrls, setReadyUrls ] = useState< Set< string > >( () => new Set() );

	// Reset the incoming video to its first frame *before* the browser paints it,
	// otherwise the element is revealed still showing the last frame from its
	// previous play and then visibly jumps back to the start. useLayoutEffect
	// runs after the DOM mutation but before paint, so the seek is never seen.
	useLayoutEffect( () => {
		videoRefs.current.forEach( ( element, videoUrl ) => {
			if ( videoUrl === activeUrl ) {
				element.currentTime = 0;
				element.play()?.catch( () => {} );
			} else {
				element.pause();
			}
		} );
	}, [ activeUrl ] );

	const markReady = useCallback( ( videoUrl: string ) => {
		setReadyUrls( ( prev ) => {
			if ( prev.has( videoUrl ) ) {
				return prev;
			}

			const next = new Set( prev );
			next.add( videoUrl );
			return next;
		} );
	}, [] );

	// Only reveal the active video once its own element has a decoded frame.
	const visibleUrl = activeUrl && readyUrls.has( activeUrl ) ? activeUrl : undefined;

	return (
		<>
			{ ALL_VIDEO_URLS.map( ( videoUrl ) => (
				<Box
					key={ videoUrl }
					component="video"
					src={ videoUrl }
					preload="auto"
					muted
					playsInline
					onLoadedData={ () => markReady( videoUrl ) }
					ref={ ( element: HTMLVideoElement | null ) => {
						if ( element ) {
							videoRefs.current.set( videoUrl, element );
						}
					} }
					sx={ {
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						opacity: videoUrl === visibleUrl ? 1 : 0,
						transition: `opacity ${ VIDEO_TRANSITION_MS }ms ease`,
					} }
				/>
			) ) }
		</>
	);
} );

interface RightPanelProps {
	config: StepVisualConfig;
}

export const RightPanel = React.memo( function RightPanel( { config }: RightPanelProps ) {
	return (
		<RightPanelRoot background={ config.background }>
			<VideoStack activeUrl={ config.video } />
		</RightPanelRoot>
	);
} );
