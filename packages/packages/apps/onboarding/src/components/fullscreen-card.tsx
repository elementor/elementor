import * as React from 'react';
import { Box, Button, Link, Paper, styled } from '@elementor/ui';

import { getOnboardingAssetUrl } from '../steps/step-visuals';

const BACKDROP_OPACITY = 0.6;

interface FullscreenCardRootProps {
	backgroundUrl: string;
}

const FullscreenCardRoot = styled( Box, {
	shouldForwardProp: ( prop ) => prop !== 'backgroundUrl',
} )< FullscreenCardRootProps >( ( { theme, backgroundUrl } ) => ( {
	position: 'relative',
	minHeight: '100%',
	width: '100%',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: theme.spacing( 4 ),
	backgroundImage: `url(${ backgroundUrl })`,
	backgroundSize: 'cover',
	backgroundPosition: 'center',
	backgroundRepeat: 'no-repeat',
} ) );

const Backdrop = styled( Box )( ( { theme } ) => ( {
	position: 'absolute',
	inset: 0,
	backgroundColor: theme.palette.text.primary,
	opacity: BACKDROP_OPACITY,
} ) );

export const Card = styled( Paper )( ( { theme } ) => ( {
	width: 512,
	maxWidth: '90%',
	padding: theme.spacing( 6, 6, 5 ),
	borderRadius: theme.shape.borderRadius * 2,
	boxShadow: theme.shadows[ 24 ],
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: theme.spacing( 3 ),
	position: 'relative',
	zIndex: 1,
} ) );

export const PrimaryButton = styled( Button )( ( { theme } ) => ( {
	borderRadius: theme.shape.borderRadius,
	textTransform: 'none',
	fontSize: theme.typography.pxToRem( 15 ),
	fontWeight: 500,
	letterSpacing: '0.46px',
	lineHeight: theme.typography.pxToRem( 26 ),
	padding: theme.spacing( 1, 2.75 ),
	minHeight: theme.spacing( 6 ),
} ) );

export const SecondaryButton = styled( Button )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	flexWrap: 'wrap',
	gap: theme.spacing( 1 ),
	border: `1px solid ${ theme.palette.divider }`,
	borderRadius: theme.shape.borderRadius,
	textTransform: 'none',
	fontSize: theme.typography.pxToRem( 15 ),
	fontWeight: 500,
	letterSpacing: '0.46px',
	lineHeight: theme.typography.pxToRem( 26 ),
	padding: theme.spacing( 1, 3 ),
} ) );

export const SocialIconWrapper = styled( Paper )( ( { theme } ) => ( {
	width: theme.spacing( 3.5 ),
	height: theme.spacing( 3.5 ),
	borderRadius: '50%',
	border: `1px solid ${ theme.palette.divider }`,
	boxShadow: 'none',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	marginLeft: theme.spacing( -1 ),
	'&:first-of-type': {
		marginLeft: 0,
		zIndex: 1,
	},
	'&:nth-of-type(2)': {
		zIndex: 2,
	},
	'&:nth-of-type(3)': {
		zIndex: 3,
	},
	'& svg': {
		width: theme.spacing( 2.5 ),
		height: theme.spacing( 2.5 ),
	},
} ) );

export const TextButton = styled( Link )( ( { theme } ) => ( {
	textTransform: 'none',
	fontSize: theme.typography.pxToRem( 13 ),
	fontWeight: 500,
	letterSpacing: '0.46px',
	lineHeight: theme.typography.pxToRem( 22 ),
} ) );

const backgroundUrl = getOnboardingAssetUrl( 'login.png' );

interface FullscreenCardProps {
	children: React.ReactNode;
	'data-testid'?: string;
}

export function FullscreenCard( { children, 'data-testid': testId }: FullscreenCardProps ) {
	return (
		<FullscreenCardRoot backgroundUrl={ backgroundUrl } data-testid={ testId }>
			<Backdrop />
			<Card elevation={ 24 }>{ children }</Card>
		</FullscreenCardRoot>
	);
}
