import router from '@elementor/router';
import KitsComponent from './data/component';

export default class KitLibrary {
	constructor() {
		$e.components.register( new KitsComponent() );

		router.addRoute( {
			path: '/kit-library/*',
			component: React.lazy( () => import( /** webpackChunkName: kit-library */ './app' ) ),
		} );
	}
}
