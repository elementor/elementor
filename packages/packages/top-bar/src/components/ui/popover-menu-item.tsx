import * as React from 'react';
import {
	MenuItem,
	MenuItemProps,
	styled,
	ListItemText,
	ListItemIcon,
	ListItemButton,
	ListItemButtonProps,
} from '@elementor/ui';

type ExtraProps = {
	href?: string;
	target?: string;
	text?: string;
	icon?: JSX.Element;
}

// The 'a' tag color is affected on hover by a global CSS color that applies on 'body a:hover {}'.
const StyleListItemButton = styled( ListItemButton )( ( { theme } ) => ( {
	'&.MuiListItemButton-root:hover': {
		color: theme.palette.text.primary,
	},
} ) );

const MenuItemInnerWrapper: React.FC<ListItemButtonProps> = ( { children, href, target } ) => {
	if ( ! href ) {
		return <>{ children }</>;
	}

	return (
		<StyleListItemButton component="a" role="menuitem" href={ href } target={ target }>
			{ children }
		</StyleListItemButton>
	);
};

export default function PopoverMenuItem( { text, icon, onClick, href, target, disabled, ...props }: MenuItemProps & ExtraProps ) {
	return (
		<MenuItem { ...props } disabled={ disabled } onClick={ onClick } role={ href ? 'presentation' : 'menuitem' }>
			<MenuItemInnerWrapper href={ href } target={ target }>
				<ListItemIcon>{ icon }</ListItemIcon>
				<ListItemText primary={ text } />
			</MenuItemInnerWrapper>
		</MenuItem>
	);
}
