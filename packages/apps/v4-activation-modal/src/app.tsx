import * as React from 'react';
import { useCallback, useState } from 'react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';

import { AppContent } from './components';

export function App() {
	const [ isMounted, setIsMounted ] = useState( true );

	const handleDisposed = useCallback( () => setIsMounted( false ), [] );

	if ( ! isMounted ) {
		return null;
	}

	return (
		<DirectionProvider rtl={ document.dir === 'rtl' }>
			<LocalizationProvider>
				<ThemeProvider colorScheme="light" palette="unstable">
					<AppContent onClose={ handleDisposed } />
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
}
