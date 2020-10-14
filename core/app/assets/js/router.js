/**
 * App Router
 *
 * TODO: Temporary solution for routing extensibility.
 */

class Router {
	/**
	 * @type {*[]}
	 */
	routes = [];

	history = null;

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

	getRoutes() {
		return this.routes.map( ( route ) => {
			const props = route.props || {};
			// Use the path as a key, and add it as a prop.
			props.path = props.key = route.path;
			return React.createElement( route.component, props );
		} );
	}
}

const router = new Router();

// Make router available for use within packages.
window.elementorAppPackages = {
	router,
};

export default router;
