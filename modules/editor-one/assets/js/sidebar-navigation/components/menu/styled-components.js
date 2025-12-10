import { List, ListItem, ListItemButton, ListItemIcon, styled } from '@elementor/ui';
import ChevronDownIcon from '@elementor/icons/ChevronDownIcon';

export const MenuList = styled( List )( ( { theme } ) => ( {
	paddingLeft: theme.spacing( 2 ),
	paddingRight: theme.spacing( 2 ),
} ) );

export const MenuItemButton = styled( ListItemButton )( ( { theme } ) => ( {
	borderRadius: theme.shape.borderRadius,
	paddingLeft: theme.spacing( 1 ),
	paddingRight: theme.spacing( 1 ),
	marginBottom: 0,
	paddingBottom: 0,
} ) );

export const MenuIcon = styled( ListItemIcon )( {
	minWidth: 28,
	'& svg': {
		fontSize: 20,
	},
} );

export const ChildMenuItemButton = styled( ListItemButton )( ( { theme } ) => ( {
	paddingLeft: theme.spacing( 6 ),
	paddingRight: theme.spacing( 2 ),
	minHeight: 32,
} ) );

export const ChildListItem = styled( ListItem )( {
	maxHeight: 32,
} );

export const ExpandIcon = styled( ChevronDownIcon, {
	shouldForwardProp: ( prop ) => prop !== 'expanded',
} )( ( { expanded } ) => ( {
	fontSize: 20,
	transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
	transition: 'transform 0.2s',
} ) );

