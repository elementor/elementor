import * as React from 'react';
import { Stack, type StackProps } from '@elementor/ui';

import { MenuContextProvider } from '../../contexts/menu-context';

type ToolbarMenuProps = StackProps;

export default function ToolbarMenu( { children, ...props }: ToolbarMenuProps ) {
	return (
		<MenuContextProvider type={ 'toolbar' }>
			<Stack sx={ { px: 1.5 } } spacing={ 1.5 } direction="row" alignItems="center" { ...props }>
				{ children }
			</Stack>
		</MenuContextProvider>
	);
}
