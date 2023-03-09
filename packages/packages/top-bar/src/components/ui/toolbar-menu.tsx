import * as React from 'react';
import { ReactNode } from 'react';
import { Stack } from '@elementor/ui';
import { MenuContextProvider } from '../../contexts/menu-context';

export default function ToolbarMenu( { children }: { children?: ReactNode } ) {
	return (
		<MenuContextProvider type={ 'toolbar' }>
			<Stack sx={ { px: 4 } } spacing={ 4 } direction="row" alignItems="center">
				{ children }
			</Stack>
		</MenuContextProvider>
	);
}
