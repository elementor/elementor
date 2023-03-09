import * as React from 'react';
import { Menu, MenuProps } from '@elementor/ui';
import { MenuContextProvider } from '../../contexts/menu-context';

export default function PopoverMenu( { children, ...props }: MenuProps ) {
	return (
		<MenuContextProvider type={ 'popover' }>
			<Menu
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
