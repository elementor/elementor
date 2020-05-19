/**
 * Elementor App
 */
import { Router, LocationProvider, createHistory } from '@reach/router';
import { createHashSource } from 'reach-router-hash-history';
import SiteEditorPromotion from 'elementor-app/modules/site-editor/pages/promotion';
import NotFound from 'elementor-app/pages/not-found';
import './app.css';

export default function App() {
	// Use hash route because it's actually rendered on a WP Admin page.
	// Make it public for external uses.
	elementorAppLoader.appHistory = createHistory( createHashSource() );

	return (
		<LocationProvider history={ elementorAppLoader.appHistory }>
			<Router>
				<SiteEditorPromotion path="/site-editor/promotion" />
				{ elementorAppLoader.getRoutes( this ) }
				<NotFound default />
			</Router>
		</LocationProvider>
	);
}
