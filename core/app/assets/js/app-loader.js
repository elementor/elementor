/**
 * App Loader
 *
 * TODO: Temporary solution for routing extensibility and share components.
 */

import * as library from './components-library';

class AppLoader {
	library = library;

	/**
	 * @type {*[]}
	 */
	components = [];

	/**
	 *
	 * @param component {{
	 *		path: string,
	 *		component: object,
	 *		props: object,
	 * }}
	 */
	addComponent( component ) {
		this.components.push( component );
	}

	/**
	 *
	 * @param app
	 */
	onAppInit( app ) {
		this.app = app;

		this.components.forEach( ( component ) => {
			app.addRoute( component.path, component.component, component.props );
		} );
	}
}

window.elementorAppLoader = new AppLoader();
