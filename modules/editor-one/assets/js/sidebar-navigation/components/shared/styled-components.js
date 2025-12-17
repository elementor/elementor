import { Box, IconButton, List, ListItem, ListItemButton, ListItemIcon, Popover, ListSubheader, styled } from '@elementor/ui';
import ChevronDownSmallIcon from '@elementor/icons/ChevronDownSmallIcon';

export const NavContainer = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	height: '100%',
	backgroundColor: theme.palette.background.paper,
	borderInlineEnd: `1px solid ${ theme.palette.divider }`,
} ) );

export const SiteIconBox = styled( Box )( ( { theme } ) => ( {
	width: 40,
	height: 40,
	borderRadius: theme.shape.borderRadius * 2,
	border: `1px solid ${ theme.palette.divider }`,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: theme.palette.background.paper,
	color: theme.palette.action.active,
	'& svg': {
		fontSize: 24,
	},
} ) );

export const CollapseButton = styled( IconButton )( ( { theme } ) => ( {
	position: 'absolute',
	insetInlineEnd: -12,
	bottom: -12,
	width: 24,
	height: 24,
	backgroundColor: theme.palette.background.paper,
	border: `1px solid ${ theme.palette.divider }`,
	color: theme.palette.action.active,
	zIndex: 1,
	'&:hover': {
		backgroundColor: theme.palette.background.paper,
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

export const MenuList = styled( List )( ( { theme } ) => ( {
	padding: theme.spacing( 2 ),
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

export const CollapsedMenuItemContainer = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	justifyContent: 'center',
	marginBottom: theme.spacing( 0.5 ),
} ) );

export const CollapsedIconButton = styled( IconButton, {
	shouldForwardProp: ( prop ) => prop !== 'isHighlighted',
} )( ( { theme, isHighlighted } ) => ( {
	width: 36,
	height: 36,
	borderRadius: theme.shape.borderRadius,
	backgroundColor: isHighlighted ? theme.palette.action.selected : 'transparent',
	color: theme.palette.text.primary,
	'&:hover': {
		backgroundColor: theme.palette.action.hover,
	},
	'& svg': {
		fontSize: 20,
	},
} ) );

export const PopoverTitle = styled( ListSubheader )( ( { theme } ) => ( {
	color: theme.palette.text.tertiary,
	fontSize: 12,
	fontWeight: 400,
	height: 28,
} ) );

export const PopoverContent = styled( Box )( ( { theme } ) => ( {
	paddingTop: theme.spacing( 1 ),
	paddingBottom: theme.spacing( 1 ),
} ) );

export const CollapsedHeaderContainer = styled( Box )( ( { theme } ) => ( {
	position: 'relative',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	height: 80,
	borderBottom: `1px solid ${ theme.palette.divider }`,
} ) );

export const PopoverListItemButton = styled( ListItemButton )( ( { theme } ) => ( {
	paddingLeft: theme.spacing( 2 ),
	paddingRight: theme.spacing( 2 ),
	paddingTop: theme.spacing( 0.5 ),
	paddingBottom: theme.spacing( 0.5 ),
} ) );

export const StyledPopover = styled( Popover )( ( { theme } ) => ( {
	pointerEvents: 'none',
	'& .MuiPaper-root': {
		marginLeft: theme.spacing( 1 ),
		minWidth: 180,
		borderRadius: theme.shape.borderRadius,
		pointerEvents: 'auto',
	},
} ) );
