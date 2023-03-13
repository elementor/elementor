import * as React from 'react';
import {
	MenuItem,
	MenuItemProps,
	ListItemText,
	ListItemIcon,
	ListItemButton,
	ListItemButtonProps,
	withDirection,
} from '@elementor/ui';
import { ArrowUpRightIcon } from '@elementor/icons';

type ExtraProps = {
	href?: string;
	target?: string;
	text?: string;
	icon?: JSX.Element;
}

export type PopoverMenuItemProps = MenuItemProps & ExtraProps;

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
			sx={ { px: 0 } }
		>
			{ children }
		</ListItemButton>
	);
};

const DirectionalArrowIcon = withDirection( ArrowUpRightIcon );

export default function PopoverMenuItem( { text, icon, onClick, href, target, disabled, ...props }: PopoverMenuItemProps ) {
	const isExternalLink = href && target === '_blank';

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
				{ isExternalLink && <DirectionalArrowIcon /> }
			</MenuItemInnerWrapper>
		</MenuItem>
	);
}
