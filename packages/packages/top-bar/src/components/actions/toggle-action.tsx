import { useMenuContext } from '../../contexts/menu-context';
import PopoverMenuItem from '../ui/popover-menu-item';
import ToolbarMenuToggleItem from '../ui/toolbar-menu-toggle-item';
import { ElementType } from 'react';

export type Props = {
	title: string;
	icon: ElementType;
	selected?: boolean;
	disabled?: boolean;
	onClick?: () => void;
	value?: string;
};

export default function ToggleAction( { icon: Icon, title, value, ...props }: Props ) {
	const { type } = useMenuContext();

	return type === 'toolbar' ? (
		<ToolbarMenuToggleItem value={ value || title } title={ title } { ...props }>
			<Icon />
		</ToolbarMenuToggleItem>
	) : (
		<PopoverMenuItem
			{ ...props }
			text={ title }
			icon={ <Icon /> }
		/>
	);
}
