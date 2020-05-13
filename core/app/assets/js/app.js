/**
 * Elementor App
 */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { Router, LocationProvider, createHistory } from '@reach/router';
import { createHashSource } from 'reach-router-hash-history';
import SiteEditorPromotion from 'elementor-app/components/site-editor/pages/promotion';
import './app.css';

export default class App extends React.Component {
	routes = {};

	constructor( props ) {
		super( props );

		this.addRoute( '/site-editor/promotion', SiteEditorPromotion );

		elementorAppLoader.onAppInit( this );
	}

	/**
	 * Allow plugins add their routes.
	 *
	 * @param path
	 * @param component
	 * @param props
	 */
	addRoute( path, component, props = {} ) {
		this.routes[ path ] = { component, props };
	}

	/**
	 * Create components for render.
	 * @returns {React.Element[]}
	 */
	getRoutes() {
		return Object.entries( this.routes ).map( ( [ path, { component, props } ] ) => {
			// Use the path as a key, and add it as a prop.
			props.path = props.key = path;
			return React.createElement( component, props );
		} );
	}

	render() {
		const NotFound = () => <h1>{ __( 'Not Found', 'elementor' ) }</h1>;

		// Use hash route because it's actually rendered on a WP Admin page.
		// Make it public for external uses.
		this.history = createHistory( createHashSource() );

		return (
			<LocationProvider history={ this.history }>
				<Router>
					{ this.getRoutes() }
					<NotFound default />
				</Router>
			</LocationProvider>
		);
	}
}
