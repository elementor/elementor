import { useMenuContext } from '../../contexts/menu-context';
import PopoverMenuItem from '../misc/popover-menu-item';
import HorizontalMenuToggleItem from '../misc/horizontal-menu-toggle-item';
import { ElementType } from 'react';

type Props = {
    title: string;
	icon: ElementType;
    selected?: boolean;
	disabled?: boolean;
	onClick?: () => void;
	value?: string;
};

export default function ToggleAction( { icon: Icon, title, value, ...props }: Props ) {
	const { type } = useMenuContext();

	return type === 'horizontal' ? (
		<HorizontalMenuToggleItem value={ value || title } title={ title } { ...props }>
			<Icon />
		</HorizontalMenuToggleItem>
	) : (
		<PopoverMenuItem { ...props }>
			<Icon />
			{ title }
		</PopoverMenuItem>
	);
}
