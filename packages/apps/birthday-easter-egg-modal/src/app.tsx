import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { DirectionProvider, LocalizationProvider, ThemeProvider } from '@elementor/ui';

import { AppContent } from './components/app-content';
import { TRIGGER_EVENT } from './constants';
import { getModalConfig } from './types';

type AppProps = {
	container?: HTMLElement;
};

export function App( { container }: AppProps ) {
	const [ isMounted, setIsMounted ] = useState( false );

	useEffect( () => {
		const handleOpen = () => setIsMounted( true );

		document.addEventListener( TRIGGER_EVENT, handleOpen );

		return () => {
			document.removeEventListener( TRIGGER_EVENT, handleOpen );
		};
	}, [] );

	const handleDisposed = useCallback( () => setIsMounted( false ), [] );

	const config = getModalConfig();

	if ( ! config || ! isMounted ) {
		return null;
	}

	return (
		<DirectionProvider rtl={ document.dir === 'rtl' }>
			<LocalizationProvider>
				<ThemeProvider colorScheme="light" palette="unstable">
					<AppContent onClose={ handleDisposed } container={ container } config={ config } />
				</ThemeProvider>
			</LocalizationProvider>
		</DirectionProvider>
	);
}
