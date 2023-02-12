import * as React from 'react';
import {
	MenuItem,
	MenuItemProps,
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

const MenuItemInnerWrapper: React.FC<ListItemButtonProps> = ( { children, href, target } ) => {
	if ( ! href ) {
		return <>{ children }</>;
	}

	return (
		<ListItemButton
			component="a"
			role="menuitem"
			href={ href }
			target={ target }
		>
			{ children }
		</ListItemButton>
	);
};

export default function PopoverMenuItem( { text, icon, onClick, href, target, disabled, ...props }: MenuItemProps & ExtraProps ) {
	return (
		<MenuItem
			{ ...props }
			disabled={ disabled }
			onClick={ onClick }
			role={ href ? 'presentation' : 'menuitem' }
		>
			<MenuItemInnerWrapper href={ href } target={ target }>
				<ListItemIcon>{ icon }</ListItemIcon>
				<ListItemText primary={ text } />
			</MenuItemInnerWrapper>
		</MenuItem>
	);
}
