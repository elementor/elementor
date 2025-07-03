import * as React from 'react';
import { ArrowUpRightIcon, ChevronRightIcon } from '@elementor/icons';
import { ListItemIcon, ListItemText, MenuItem, type MenuItemProps, withDirection } from '@elementor/ui';

type ExtraProps = {
	href?: string;
	target?: string;
	text?: string;
	icon?: JSX.Element;
	isGroupParent?: boolean;
};

type PopoverMenuItemProps = MenuItemProps & ExtraProps;

const DirectionalArrowIcon = withDirection( ArrowUpRightIcon );
const DirectionalChevronIcon = withDirection( ChevronRightIcon );

export default function PopoverMenuItem( {
	text,
	icon,
	onClick,
	href,
	target,
	disabled,
	isGroupParent,
	...props
}: PopoverMenuItemProps ) {
	const isExternalLink = href && target === '_blank';

	return (
		<MenuItem
			{ ...props }
			disabled={ disabled }
			onClick={ onClick }
			component={ href ? 'a' : 'div' }
			href={ href }
			target={ target }
			sx={ {
				'&:hover': {
					color: 'text.primary', // Overriding global CSS from the editor.
				},
			} }
		>
			<ListItemIcon>{ icon }</ListItemIcon>
			<ListItemText primary={ text } />
			{ isExternalLink && <DirectionalArrowIcon /> }
			{ isGroupParent && <DirectionalChevronIcon /> }
		</MenuItem>
	);
}
