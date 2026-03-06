import * as React from 'react';
import { useState } from 'react';
import { Box, styled } from '@elementor/ui';

import { isVideoPreloaded } from '../../hooks/use-video-preload';
import type { StepVisualConfig } from '../../types';
import { FOOTER_HEIGHT, LAYOUT_PADDING, TOPBAR_HEIGHT } from './base-layout';

const PANEL_RADIUS_MULTIPLIER = 2;
const PANEL_MIN_HEIGHT = 36;

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

const VideoPanel = React.memo( ( props: { src: string } ) => {
	const [ hasError, setHasError ] = useState( false );

	if ( ! isVideoPreloaded( props.src ) || hasError ) {
		return null;
	}

	return (
		<Box
			component="video"
			src={ props.src }
			autoPlay
			muted
			playsInline
			onError={ () => setHasError( true ) }
			sx={ {
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				objectFit: 'cover',
			} }
		/>
	);
} );

interface RightPanelProps {
	config: StepVisualConfig;
}

export const RightPanel = React.memo( function RightPanel( { config }: RightPanelProps ) {
	return (
		<RightPanelRoot background={ config.background }>
			{ config.video && <VideoPanel key={ config.video } src={ config.video } /> }
		</RightPanelRoot>
	);
} );
