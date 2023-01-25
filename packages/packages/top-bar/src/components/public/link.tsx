import { useMenuContext } from '../../contexts/menu-context';
import HorizontalMenuItem from '../misc/horizontal-menu-item';
import PopoverMenuItem from '../misc/popover-menu-item';
import { ElementType } from 'react';

export type Props = {
	title: string;
	icon: ElementType;
	href?: string;
	target?: string;
}

export default function Link( { icon: Icon, title, ...props }: Props ) {
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
