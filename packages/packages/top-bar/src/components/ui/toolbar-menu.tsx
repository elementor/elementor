import { ReactNode } from 'react';
import { Stack } from '@elementor/ui';
import { MenuContextProvider } from '../../contexts/menu-context';

export type ToolbarMenuProps = {
	children?: ReactNode;
}

export default function ToolbarMenu( { children }: ToolbarMenuProps ) {
	return (
		<MenuContextProvider type={ 'toolbar' }>
			<Stack sx={ { px: 4 } } spacing={ 4 } direction="row" alignItems="center">
				{ children }
			</Stack>
		</MenuContextProvider>
	);
}
