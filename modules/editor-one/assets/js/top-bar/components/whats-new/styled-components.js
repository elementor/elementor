import { Box, IconButton, styled } from '@elementor/ui';

export const DrawerContainer = styled( Box )( {
	width: 360,
	backgroundColor: 'background.default',
} );

export const HeaderContainer = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: theme.spacing( 2 ),
	borderBottom: `1px solid ${ theme.palette.divider }`,
} ) );

export const CloseButton = styled( IconButton )( {
	padding: 4,
} );

export const ContentContainer = styled( Box )( ( { theme } ) => ( {
	padding: theme.spacing( 2 ),
	overflowY: 'auto',
	maxHeight: 'calc(100vh - 64px)',
} ) );

export const LoadingContainer = styled( Box )( ( { theme } ) => ( {
	padding: theme.spacing( 2 ),
} ) );

export const ItemContainer = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	paddingTop: theme.spacing( 2 ),
} ) );

export const ItemMetaContainer = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing( 1 ),
	paddingBottom: theme.spacing( 1 ),
} ) );

export const ItemImage = styled( 'img' )( ( { theme } ) => ( {
	width: '100%',
	borderRadius: theme.shape.borderRadius,
	marginBottom: theme.spacing( 2 ),
} ) );

export const ItemCtaContainer = styled( Box )( ( { theme } ) => ( {
	paddingBottom: theme.spacing( 2 ),
} ) );

