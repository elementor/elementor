/**
 * Elementor App
 */
import { Router, LocationProvider, createHistory } from '@reach/router';
import { createHashSource } from 'reach-router-hash-history';
import SiteEditorPromotion from 'elementor-app/components/site-editor/pages/promotion';
import './app.css';

export default class App extends React.Component {
	render() {
		const NotFound = () => <h1>{ __( 'Not Found', 'elementor' ) }</h1>;

		// Use hash route because it's actually rendered on a WP Admin page.
		// Make it public for external uses.
		this.history = createHistory( createHashSource() );

		return (
			<LocationProvider history={ this.history }>
				<Router>
					<SiteEditorPromotion path="/site-editor/promotion" />
					{ elementorAppLoader.getRoutes( this ) }
					<NotFound default />
				</Router>
			</LocationProvider>
		);
	}
}
