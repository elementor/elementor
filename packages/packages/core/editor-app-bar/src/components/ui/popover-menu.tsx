import * as React from 'react';
import { Menu, type MenuProps, type PopupState } from '@elementor/ui';

import { MenuContextProvider } from '../../contexts/menu-context';

export type PopoverMenuProps = MenuProps & {
	popupState?: PopupState;
};

export default function PopoverMenu( { children, popupState, ...props }: PopoverMenuProps ) {
	return (
		<MenuContextProvider type={ 'popover' } popupState={ popupState }>
			<Menu
				PaperProps={ {
					sx: { mt: 1.5 },
				} }
				{ ...props }
				MenuListProps={ {
					component: 'div',
					dense: true,
				} }
			>
				{ children }
			</Menu>
		</MenuContextProvider>
	);
}
