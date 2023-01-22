import { SvgIcon } from '@elementor/ui';
import { useMenuContext } from '../../contexts/menu-context';
import PopoverMenuItem from '../misc/popover-menu-item';
import HorizontalMenuToggleItem from '../misc/horizontal-menu-toggle-item';

type Props = {
    title: string;
	icon: typeof SvgIcon;
    selected?: boolean;
	disabled?: boolean;
	onClick?: () => void;
	value?: string;
};

export default function ToggleAction( { icon: Icon, title, value, ...props }: Props ) {
	const { type } = useMenuContext();

	if ( type === 'horizontal' ) {
		return (
			<HorizontalMenuToggleItem value={ value ?? title } title={ title } { ...props }>
				{ Icon && <Icon /> }
			</HorizontalMenuToggleItem>
		);
	}

	return (
		<PopoverMenuItem value={ value ?? title } { ...props }>
			{ Icon && <Icon /> }
			{ title }
		</PopoverMenuItem>
	);
}
