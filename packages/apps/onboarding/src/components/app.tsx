import * as React from 'react';
import { useEffect, useMemo } from 'react';
import { createQueryClient, QueryClientProvider } from '@elementor/query';
import { __createStore, __getStore, __StoreProvider as StoreProvider } from '@elementor/store';
import { DirectionProvider, ThemeProvider } from '@elementor/ui';

import { initFromConfig, registerOnboardingSlice } from '../store';
import { AppContent } from './app-content';

type ColorSchemePreference = 'auto' | 'dark' | 'light';
type ResolvedColorScheme = 'dark' | 'light';

function resolveColorScheme( preference: ColorSchemePreference ): ResolvedColorScheme {
	if ( preference === 'dark' ) {
		return 'dark';
	}

	if ( preference === 'light' ) {
		return 'light';
	}

	const prefersDark = window.matchMedia?.( '(prefers-color-scheme: dark)' ).matches;

	return prefersDark ? 'dark' : 'light';
}

interface AppProps {
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

	useEffect( () => {
		store.dispatch( initFromConfig() );
	}, [ store ] );

	const queryClient = useMemo( () => createQueryClient(), [] );

	const uiTheme = window.elementorAppConfig?.[ 'e-onboarding' ]?.uiTheme ?? 'auto';
	const colorScheme = useMemo( () => resolveColorScheme( uiTheme ), [ uiTheme ] );

	return (
		<StoreProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<DirectionProvider rtl={ window.document.dir === 'rtl' }>
					<ThemeProvider colorScheme={ colorScheme } palette="argon-beta">
						<AppContent { ...props } />
					</ThemeProvider>
				</DirectionProvider>
			</QueryClientProvider>
		</StoreProvider>
	);
}
