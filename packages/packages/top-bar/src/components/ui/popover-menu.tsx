import { Menu, MenuProps } from '@elementor/ui';
import { MenuContextProvider } from '../../contexts/menu-context';

export default function PopoverMenu( { children, ...props }: MenuProps ) {
	return (
		<MenuContextProvider type={ 'popover' }>
			<Menu
				MenuListProps={ {
					component: 'div',
				} }
				PaperProps={ {
					sx: { mt: 4 },
				} }
				{ ...props }
			>
				{ children }
			</Menu>
		</MenuContextProvider>
	);
}
