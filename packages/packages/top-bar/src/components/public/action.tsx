import { useMenuContext } from '../../contexts/menu-context';
import HorizontalMenuItem from '../misc/horizontal-menu-item';
import PopoverMenuItem from '../misc/popover-menu-item';
import { ElementType } from 'react';

type Props = {
	title: string;
	icon: ElementType;
	disabled?: boolean;
	onClick?: () => void;
};

export default function Action( { icon: Icon, title, ...props }: Props ) {
	const { type } = useMenuContext();

	return type === 'horizontal' ? (
		<HorizontalMenuItem title={ title } { ...props }>
			<Icon />
		</HorizontalMenuItem>
	) : (
		<PopoverMenuItem { ...props }>
			<Icon />
			{ title }
		</PopoverMenuItem>
	);
}
