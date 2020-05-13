/**
 * App Loader
 *
 * TODO: Temporary solution for routing extensibility and share components.
 */

import React from 'react';
import * as library from './components-library';

class AppLoader {
	library = library;

	/**
	 * @type {*[]}
	 */
	routes = [];

	/**
	 *
	 * @param route {{
	 *		path: string,
	 *		component: object,
	 *		props: object,
	 * }}
	 */
	addRoute( route ) {
		this.routes.push( route );
	}

	/**
	 *
	 * @param app
	 */
	getRoutes( app ) {
		this.app = app;

		return this.routes.map( ( route ) => {
			const props = route.props || {};
			// Use the path as a key, and add it as a prop.
			props.path = props.key = route.path;
			return React.createElement( route.component, props );
		} );
	}
}

window.elementorAppLoader = new AppLoader();
