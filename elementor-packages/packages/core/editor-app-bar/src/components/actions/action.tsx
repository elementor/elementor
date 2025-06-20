import * as React from 'react';
import { type ElementType } from 'react';

import { useMenuContext } from '../../contexts/menu-context';
import PopoverMenuItem from '../ui/popover-menu-item';
import ToolbarMenuItem from '../ui/toolbar-menu-item';

export type Props = {
	title: string;
	icon: ElementType;
	disabled?: boolean;
	visible?: boolean;
	onClick?: () => void;
};

export default function Action( { icon: Icon, title, visible = true, ...props }: Props ) {
	const { type } = useMenuContext();

	if ( ! visible ) {
		return null;
	}

	return type === 'toolbar' ? (
		<ToolbarMenuItem title={ title } { ...props }>
			<Icon />
		</ToolbarMenuItem>
	) : (
		<PopoverMenuItem { ...props } text={ title } icon={ <Icon /> } />
	);
}
