import * as React from 'react';
import { type ComponentType } from 'react';
import { ListItemIcon, ListItemText, MenuItem, type MenuItemProps as MenuItemPropsType } from '@elementor/ui';

type Props = {
	title: string;
	icon: ComponentType;
	MenuItemProps: MenuItemPropsType;
};

export default function ActionMenuItem( { title, icon: Icon, MenuItemProps }: Props ) {
	return (
		<MenuItem { ...MenuItemProps }>
			<ListItemIcon
				sx={ {
					color: 'inherit',
				} }
			>
				<Icon />
			</ListItemIcon>
			<ListItemText primary={ title } />
		</MenuItem>
	);
}
