import { List, ListItemButton, styled } from '@elementor/ui';
import ChevronDownIcon from '@elementor/icons/ChevronDownIcon';

export const MenuList = styled( List )( ( { theme } ) => ( {
	paddingLeft: theme.spacing( 2 ),
	paddingRight: theme.spacing( 2 ),
	paddingTop: theme.spacing( 1 ),
	paddingBottom: theme.spacing( 1 ),
} ) );

export const MenuItemButton = styled( ListItemButton )( ( { theme } ) => ( {
	borderRadius: theme.shape.borderRadius,
	marginBottom: theme.spacing( 1 ),
	paddingTop: theme.spacing( 0.5 ),
	paddingBottom: theme.spacing( 0.5 ),
	paddingLeft: theme.spacing( 1.5 ),
	paddingRight: theme.spacing( 1 ),
	minHeight: 32,
} ) );

export const ChildMenuItemButton = styled( ListItemButton )( ( { theme } ) => ( {
	borderRadius: theme.shape.borderRadius,
	paddingLeft: theme.spacing( 5 ),
	paddingRight: theme.spacing( 2 ),
	paddingTop: theme.spacing( 0.5 ),
	paddingBottom: theme.spacing( 0.5 ),
	minHeight: 32,
} ) );

export const ExpandIcon = styled( ChevronDownIcon, {
	shouldForwardProp: ( prop ) => prop !== 'expanded',
} )( ( { expanded } ) => ( {
	fontSize: 20,
	transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
	transition: 'transform 0.2s',
} ) );

