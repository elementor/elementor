import * as React from 'react';
import { useEffect, useState } from 'react';
import { Box, styled } from '@elementor/ui';

import type { AssetAnimation, RightPanelAsset, StepVisualConfig } from '../../types';

const ANIMATION_DURATION_MS = 400;
const ANIMATION_OFFSET_PX = 24;
const PANEL_RADIUS_MULTIPLIER = 2;
const PANEL_MIN_HEIGHT = 36;

interface RightPanelRootProps {
	background: string;
}

const RightPanelRoot = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'background',
} )< RightPanelRootProps >( ( { theme, background } ) => ( {
	position: 'relative',
	width: '100%',
	height: '100%',
	minHeight: theme.spacing( PANEL_MIN_HEIGHT ),
	borderRadius: theme.shape.borderRadius * PANEL_RADIUS_MULTIPLIER,
	overflow: 'hidden',
	background,
} ) );

const AssetImage = styled( 'img' )( {
	position: 'absolute',
	maxWidth: '100%',
	height: 'auto',
	transition: `opacity ${ ANIMATION_DURATION_MS }ms ease, transform ${ ANIMATION_DURATION_MS }ms ease`,
} );

const getAnimationStyle = ( animation: AssetAnimation, isVisible: boolean ) => {
	if ( animation === 'none' ) {
		return {
			opacity: 1,
			transform: 'translateY(0)',
		};
	}

	const opacity = isVisible ? 1 : 0;
	const transform =
		animation === 'fade-up' ? `translateY(${ isVisible ? 0 : ANIMATION_OFFSET_PX }px)` : 'translateY(0)';

	return { opacity, transform };
};

const RightPanelAssetItem = React.memo( function RightPanelAssetItem( { asset }: { asset: RightPanelAsset } ) {
	const [ isVisible, setIsVisible ] = useState( false );

	useEffect( () => {
		setIsVisible( true );
	}, [] );

	const animation = asset.animation ?? 'fade-in';
	const animationStyle = getAnimationStyle( animation, isVisible );

	return (
		<AssetImage
			src={ asset.src }
			alt={ asset.alt ?? '' }
			aria-hidden={ ! asset.alt }
			draggable={ false }
			style={ { ...asset.style, ...animationStyle } }
		/>
	);
} );

interface RightPanelProps {
	config: StepVisualConfig;
}

export const RightPanel = React.memo( function RightPanel( { config }: RightPanelProps ) {
	return (
		<RightPanelRoot background={ config.background }>
			{ config.assets.map( ( asset ) => (
				<RightPanelAssetItem key={ asset.id } asset={ asset } />
			) ) }
		</RightPanelRoot>
	);
} );
