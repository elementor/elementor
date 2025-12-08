import { Box, IconButton, styled } from '@elementor/ui';

export const NavContainer = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	height: '100%',
	backgroundColor: theme.palette.background.paper,
	borderRight: `1px solid ${ theme.palette.divider }`,
} ) );

export const SiteIconBox = styled( Box )( ( { theme } ) => ( {
	width: 40,
	height: 40,
	borderRadius: theme.shape.borderRadius,
	border: `1px solid ${ theme.palette.divider }`,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: theme.palette.background.paper,
	'& svg': {
		fontSize: 24,
	},
} ) );

export const CollapseButton = styled( IconButton )( ( { theme } ) => ( {
	position: 'absolute',
	right: -12,
	bottom: -12,
	width: 24,
	height: 24,
	backgroundColor: theme.palette.background.paper,
	border: `1px solid ${ theme.palette.divider }`,
	color: theme.palette.text.secondary,
	zIndex: 1,
	'&:hover': {
		backgroundColor: theme.palette.action.hover,
	},
	'& svg': {
		fontSize: 16,
	},
} ) );

export const ScrollableContent = styled( Box )( {
	flex: 1,
	overflowY: 'auto',
	overflowX: 'hidden',
} );

