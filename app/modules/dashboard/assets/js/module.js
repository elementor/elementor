import router from '@elementor/router';

export default class Dashboard {
	constructor() {
		router.addRoute( {
			path: '/dashboard/*',
			component: React.lazy( () => import( /* webpackChunkName: 'dashboard' */ './app' ) ),
		} );
	}
}
