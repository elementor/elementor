import { useMenuContext } from '../../contexts/menu-context';
import ToolbarMenuItem from '../ui/toolbar-menu-item';
import PopoverMenuItem from '../ui/popover-menu-item';
import { ElementType } from 'react';

export type Props = {
	title: string;
	icon: ElementType;
	href?: string;
	target?: string;
}

export default function Link( { icon: Icon, title, ...props }: Props ) {
	const { type } = useMenuContext();

	return type === 'toolbar' ? (
		<ToolbarMenuItem title={ title } { ...props }>
			<Icon />
		</ToolbarMenuItem>
	) : (
		<PopoverMenuItem
			{ ...props }
			text={ title }
			icon={ <Icon /> }
		/>
	);
}
