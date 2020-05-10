/**
 * Elementor App
 */
import React from 'react';
import { Router, LocationProvider, createHistory } from '@reach/router';
import { createHashSource } from 'reach-router-hash-history';
import SiteEditorPromotion from 'elementor-app/components/site-editor/pages/promotion';
import './app.css';

export default class App extends React.Component {
	components = {};

	/**
	 * Allow plugins add their routes.
	 *
	 * @param path
	 * @param component
	 * @param props
	 */
	addComponentRoute( path, component, props = {} ) {
		this.components[ path ] = { component, props };
	}

	/**
	 * Create components for render.
	 * @returns {React.Element[]}
	 */
	getComponents() {
		return Object.entries( this.components ).map( ( [ path, { component, props } ] ) => {
			// Use the path as a key, and add it as a prop.
			props.path = props.key = path;
			return React.createElement( component, props );
		} );
	}

	render() {
		this.addComponentRoute( '/site-editor/promotion', SiteEditorPromotion );
		const NotFound = () => <h1>Not Found</h1>;

		return (
			<LocationProvider history={ createHistory( createHashSource() ) }>
				<Router>
					{ this.getComponents() }
					<NotFound default />
				</Router>
			</LocationProvider>
		);
	}
}
