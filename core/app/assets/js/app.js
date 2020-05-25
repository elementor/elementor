/**
 * Elementor App
 */
import router from '@elementor/router';
import { Router, LocationProvider, createHistory } from '@reach/router';
import { createHashSource } from 'reach-router-hash-history';
import NotFound from 'elementor-app/pages/not-found';
import './app.scss';

export default function App() {
	// Use hash route because it's actually rendered on a WP Admin page.
	// Make it public for external uses.
	router.appHistory = createHistory( createHashSource() );

	return (
		<LocationProvider history={ router.appHistory }>
			<Router>
				{ router.getRoutes() }
				<NotFound default />
			</Router>
		</LocationProvider>
	);
}
