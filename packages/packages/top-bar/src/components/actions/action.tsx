import { useMenuContext } from '../../contexts/menu-context';
import ToolbarMenuItem from '../ui/toolbar-menu-item';
import PopoverMenuItem from '../ui/popover-menu-item';
import { ElementType } from 'react';

export type Props = {
	title: string;
	icon: ElementType;
	disabled?: boolean;
	onClick?: () => void;
};

export default function Action( { icon: Icon, title, ...props }: Props ) {
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
