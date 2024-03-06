import router from '@elementor/router';

export default class HomeScreen {
	constructor() {
		router.addRoute( {
			path: '/home-screen/*',
			component: React.lazy( () => import( /* webpackChunkName: 'custom-module' */ './app' ) ),
		} );
	}
}
