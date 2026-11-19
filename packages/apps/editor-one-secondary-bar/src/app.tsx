import * as React from 'react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';

import { SecondaryBar } from './components/secondary-bar';
import { type SecondaryBarConfig } from './types';

type Props = {
	config: SecondaryBarConfig;
};

export function App( { config }: Props ) {
	return (
		<DirectionProvider rtl={ document.dir === 'rtl' }>
			<LocalizationProvider>
				<ThemeProvider colorScheme="light">
					<SecondaryBar config={ config } />
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
}
