import { ReactNode } from 'react';
import { Box, styled } from '@elementor/ui';
import { MenuContextProvider } from '../contexts/menu-context';

const Menu = styled( Box )`
	display: flex;
	align-items: center;
	gap: 6px;
`;

export default function HorizontalMenu( { children }: { children?: ReactNode } ) {
	return (
		<MenuContextProvider type={ 'horizontal' }>
			<Menu>
				{ children }
			</Menu>
		</MenuContextProvider>
	);
}
