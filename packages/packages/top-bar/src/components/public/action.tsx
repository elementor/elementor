import { SvgIcon } from '@elementor/ui';
import { useMenuContext } from '../../contexts/menu-context';
import HorizontalMenuItem from '../misc/horizontal-menu-item';
import PopoverMenuItem from '../misc/popover-menu-item';

type Props = {
    title: string;
	icon?: typeof SvgIcon;
	disabled?: boolean;
	onClick?: () => void;
	href?: string;
	target?: string;
};

export default function Action( { icon: Icon, title, ...props }: Props ) {
	const { type } = useMenuContext();

	if ( type === 'horizontal' ) {
		return (
			<HorizontalMenuItem title={ title } { ...props }>
				{ Icon && <Icon /> }
			</HorizontalMenuItem>
		);
	}

	return (
		<PopoverMenuItem { ...props }>
			{ Icon && <Icon /> }
			{ title }
		</PopoverMenuItem>
	);
}
