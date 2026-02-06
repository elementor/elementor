import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { createQueryClient, QueryClientProvider } from '@elementor/query';
import {
	__createStore,
	__getStore,
	__StoreProvider as StoreProvider,
} from '@elementor/store';
import { DirectionProvider, ThemeProvider } from '@elementor/ui';

import { initFromConfig, registerOnboardingSlice } from '../store';
import { AppContent } from './app-content';

interface AppProps {
	onComplete?: () => void;
	onClose?: () => void;
}

export function App( props: AppProps ) {
	const store = useMemo( () => {
		registerOnboardingSlice();

		let existingStore = __getStore();

		if ( ! existingStore ) {
			existingStore = __createStore();
		}

		return existingStore;
	}, [] );

	// Initialize store from config after mount (config is now available)
	useEffect( () => {
		store.dispatch( initFromConfig() );
	}, [ store ] );

	const queryClient = useMemo( () => createQueryClient(), [] );

	return (
		<StoreProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<DirectionProvider rtl={ window.document.dir === 'rtl' }>
					<ThemeProvider palette="argon-beta">
						<AppContent { ...props } />
					</ThemeProvider>
				</DirectionProvider>
			</QueryClientProvider>
		</StoreProvider>
	);
}
