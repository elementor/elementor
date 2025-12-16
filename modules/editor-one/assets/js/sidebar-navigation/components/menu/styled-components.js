import { List, ListItem, ListItemButton, ListItemIcon, styled } from '@elementor/ui';
import ChevronDownSmallIcon from '@elementor/icons/ChevronDownSmallIcon';

export const MenuList = styled( List )( ( { theme } ) => ( {
	paddingLeft: theme.spacing( 2 ),
	paddingRight: theme.spacing( 2 ),
} ) );

export const MenuItemButton = styled( ListItemButton )( ( { theme } ) => ( {
	paddingLeft: theme.spacing( 1 ),
	paddingRight: theme.spacing( 1 ),
	marginBottom: 0,
	paddingBottom: theme.spacing( 0.5 ),
	whiteSpace: 'nowrap',
} ) );

export const MenuIcon = styled( ListItemIcon )( ( { theme } ) => ( {
	minWidth: 28,
	color: theme.palette.text.primary,
	'& svg': {
		fontSize: 20,
	},
} ) );

export const ChildMenuItemButton = styled( ListItemButton )( ( { theme } ) => ( {
	paddingLeft: theme.spacing( 6 ),
	paddingRight: theme.spacing( 2 ),
	minHeight: 32,
	whiteSpace: 'nowrap',
} ) );

export const ChildListItem = styled( ListItem )( {
	maxHeight: 32,
} );

export const ExpandIcon = styled( ChevronDownSmallIcon, {
	shouldForwardProp: ( prop ) => prop !== 'expanded',
} )( ( { expanded } ) => ( {
	fontSize: 20,
	transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
	transition: 'transform 0.2s',
} ) );

