import { Box, IconButton, Typography, styled } from '@elementor/ui';

export const HeaderContainer = styled( Box )( ( { theme } ) => ( {
	position: 'relative',
	marginLeft: theme.spacing( 2 ),
	marginRight: theme.spacing( 2 ),
	height: 80,
	borderBottom: `1px solid ${ theme.palette.divider }`,
	display: 'flex',
	alignItems: 'center',
} ) );

export const HeaderContent = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing( 1.5 ),
	flex: 1,
} ) );

export const SiteTitle = styled( Typography )( {
	fontWeight: 500,
	flex: 1,
} );

export const SearchButton = styled( IconButton )( ( { theme } ) => ( {
	fontSize: 20,
	color: theme.palette.action.active,
} ) );

