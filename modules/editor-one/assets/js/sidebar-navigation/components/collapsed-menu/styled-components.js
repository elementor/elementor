import { Box, IconButton, ListItemButton, Popover, Typography, styled } from '@elementor/ui';

export const CollapsedMenuContainer = styled( Box )( ( { theme } ) => ( {
	paddingLeft: theme.spacing( 1 ),
	paddingRight: theme.spacing( 1 ),
	paddingTop: theme.spacing( 2 ),
	paddingBottom: theme.spacing( 2 ),
} ) );

export const CollapsedMenuItemContainer = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	justifyContent: 'center',
	marginBottom: theme.spacing( 0.5 ),
} ) );

export const CollapsedIconButton = styled( IconButton, {
	shouldForwardProp: ( prop ) => prop !== 'isHighlighted',
} )( ( { theme, isHighlighted } ) => ( {
	width: 40,
	height: 40,
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

export const PopoverTitle = styled( Typography )( ( { theme } ) => ( {
	color: theme.palette.text.tertiary,
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
