/**
 * Elementor App
 */
import { useContext } from 'react';
import router from '@elementor/router';
import { Router, LocationProvider, createHistory } from '@reach/router';
import { createHashSource } from 'reach-router-hash-history';
import NotFound from 'elementor-app/pages/not-found';
import Index from 'elementor-app/pages/index';
import ErrorBoundary from 'elementor-app/organisms/error-boundary';
import './app.scss';

import { AppContext } from 'elementor-app/app-context';

import { ThemeProvider } from 'styled-components';

const { Suspense } = React;

export default function App() {
	const appContext = useContext( AppContext ),
		{ isDarkMode } = appContext.state,
		theme = {
			config: {
				variants: {
					light: ! isDarkMode,
					dark: isDarkMode,
				},
			},
		};

	// Use hash route because it's actually rendered on a WP Admin page.
	// Make it public for external uses.
	router.appHistory = createHistory( createHashSource() );

	return (
		<ErrorBoundary>
			<LocationProvider history={ router.appHistory }>
				<ThemeProvider theme={ theme }>
					<Suspense fallback={ null }>
						<Router>
							{ router.getRoutes() }
							<Index path="/" />
							<NotFound default />
						</Router>
					</Suspense>
				</ThemeProvider>
			</LocationProvider>
		</ErrorBoundary>
	);
}
