import * as React from 'react';
import { useMemo } from 'react';
import { createQueryClient, QueryClientProvider } from '@elementor/query';
import { __createStore, __getStore, __StoreProvider as StoreProvider } from '@elementor/store';
import { DirectionProvider, ThemeProvider } from '@elementor/ui';

import { TrackingProvider } from '../analytics/tracking-context';
import { initFromConfig, registerOnboardingSlice } from '../store';
import { AppContent } from './app-content';
import { ToastProvider } from './toast/toast-context';

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

		existingStore.dispatch( initFromConfig() );

		return existingStore;
	}, [] );

	const queryClient = useMemo( () => createQueryClient(), [] );

	const uiTheme = window.elementorAppConfig?.[ 'e-onboarding' ]?.uiTheme ?? 'auto';
	const colorScheme = useMemo( () => resolveColorScheme( uiTheme ), [ uiTheme ] );

	return (
		<StoreProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<DirectionProvider rtl={ window.document.dir === 'rtl' }>
					<ThemeProvider colorScheme={ colorScheme } palette="argon-beta">
						<ToastProvider>
							<TrackingProvider>
								<AppContent { ...props } />
							</TrackingProvider>
						</ToastProvider>
					</ThemeProvider>
				</DirectionProvider>
			</QueryClientProvider>
		</StoreProvider>
	);
}
