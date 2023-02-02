import { ReactNode } from 'react';
import { Box } from '@elementor/ui';
import { MenuContextProvider } from '../../contexts/menu-context';

export default function ToolbarMenu( { children }: { children?: ReactNode } ) {
	return (
		<MenuContextProvider type={ 'toolbar' }>
			<Box sx={ { display: 'flex', alignItems: 'center', gap: '6px' } }>
				{ children }
			</Box>
		</MenuContextProvider>
	);
}
