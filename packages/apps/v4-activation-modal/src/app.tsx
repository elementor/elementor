import * as React from 'react';
import { useCallback, useState } from 'react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';

import { AppContent } from './components';

export function App() {
	const [ isOpen, setIsOpen ] = useState( true );

	const handleClose = useCallback( () => {
		setIsOpen( false );
	}, [] );

	return (
		<DirectionProvider rtl={ document.dir === 'rtl' }>
			<LocalizationProvider>
				<ThemeProvider colorScheme="light" palette="unstable">
					{ isOpen && <AppContent onClose={ handleClose } /> }
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
}
