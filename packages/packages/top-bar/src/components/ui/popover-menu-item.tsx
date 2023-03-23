import * as React from 'react';
import {
	MenuItem,
	MenuItemProps,
	ListItemText,
	ListItemIcon,
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

const DirectionalArrowIcon = withDirection( ArrowUpRightIcon );

export default function PopoverMenuItem( { text, icon, onClick, href, target, disabled, ...props }: PopoverMenuItemProps ) {
	const isExternalLink = href && target === '_blank';

	return (
		<MenuItem
			{ ...props }
			disabled={ disabled }
			onClick={ onClick }
			component={ href ? 'a' : 'div' }
			href={ href }
			target={ target }
		>
			<ListItemIcon>{ icon }</ListItemIcon>
			<ListItemText primary={ text } />
			{ isExternalLink && <DirectionalArrowIcon /> }
		</MenuItem>
	);
}
