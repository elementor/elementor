import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Box, styled } from '@elementor/ui';

import type { StepVisualConfig } from '../../types';
import { getVideoUrls } from '../../steps/step-visuals';
import { isVideoPreloaded } from '../../hooks/use-video-preload';
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
	const [ visibleUrl, setVisibleUrl ] = useState< string | undefined >( undefined );

	useEffect( () => {
		videoRefs.current.forEach( ( element, videoUrl ) => {
			if ( videoUrl === activeUrl ) {
				element.currentTime = 0;
				element.play().catch( () => {} );
			} else {
				element.pause();
			}
		} );

		setVisibleUrl( activeUrl && isVideoPreloaded( activeUrl ) ? activeUrl : undefined );
	}, [ activeUrl ] );

	return (
		<>
			{ ALL_VIDEO_URLS.map( ( videoUrl ) => (
				<Box
					key={ videoUrl }
					component="video"
					src={ videoUrl }
					muted
					playsInline
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
