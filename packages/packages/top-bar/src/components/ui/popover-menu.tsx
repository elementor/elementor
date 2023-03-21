import { Menu, MenuProps } from '@elementor/ui';
import { MenuContextProvider } from '../../contexts/menu-context';

export type PopoverMenuProps = MenuProps;

export default function PopoverMenu( { children, ...props }: PopoverMenuProps ) {
	return (
		<MenuContextProvider type={ 'popover' }>
			<Menu
				PaperProps={ {
					sx: { mt: 4 },
				} }
				{ ...props }
				MenuListProps={ {
					component: 'div',
				} }
			>
				{ children }
			</Menu>
		</MenuContextProvider>
	);
}
