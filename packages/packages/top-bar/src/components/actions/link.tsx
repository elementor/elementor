import { useMenuContext } from '../../contexts/menu-context';
import ToolbarMenuItem from '../ui/toolbar-menu-item';
import PopoverMenuItem from '../ui/popover-menu-item';
import { ElementType } from 'react';

export type Props = {
	title: string;
	icon: ElementType;
	href?: string;
	visible?: boolean;
	target?: string;
}

export default function Link( { icon: Icon, title, visible = true, ...props }: Props ) {
	const { type } = useMenuContext();

	if ( ! visible ) {
		return null;
	}

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
