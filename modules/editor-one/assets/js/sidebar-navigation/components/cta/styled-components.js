import { Box, Button, styled } from '@elementor/ui';

export const CtaContainer = styled( Box )( ( { theme } ) => ( {
	padding: theme.spacing( 2 ),
} ) );

export const CtaButton = styled( Button )( {
	justifyContent: 'center',
	whiteSpace: 'nowrap',
} );

export const CollapsedCtaContainer = styled( Box )( ( { theme } ) => ( {
	padding: theme.spacing( 2 ),
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
} ) );

export const CollapsedCtaButton = styled( 'button' )( ( { theme } ) => ( {
	border: `1px solid ${ theme.palette.promotion.main }`,
	borderRadius: 999,
	width: 24,
	height: 24,
	padding: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	background: 'transparent',
	cursor: 'pointer',
	color: theme.palette.promotion.main,
	transition: 'all 0.2s ease-in-out',
	whiteSpace: 'nowrap',
	'&:hover': {
		background: theme.palette.promotion.hover,
	},
	'& svg': {
		width: 18,
		height: 18,
		fill: theme.palette.promotion.main,
	},
} ) );

