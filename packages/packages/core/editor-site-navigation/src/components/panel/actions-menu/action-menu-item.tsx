import * as React from 'react';
import { type ComponentType } from 'react';
import { ListItemIcon, ListItemText, MenuItem, type MenuItemProps as MenuItemPropsType } from '@elementor/ui';

type Props = {
	description?: string;
	icon: ComponentType;
	MenuItemProps: MenuItemPropsType;
	title: string;
};

export default function ActionMenuItem( { description, icon: Icon, MenuItemProps, title }: Props ) {
	return (
		<MenuItem { ...MenuItemProps }>
			<ListItemIcon
				sx={ {
					color: 'inherit',
				} }
			>
				<Icon />
			</ListItemIcon>
			<ListItemText primary={ title } secondary={ description } />
		</MenuItem>
	);
}
