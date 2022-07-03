import router from '@elementor/router';

export default class Onboarding {
	constructor() {
		router.addRoute( {
			path: '/onboarding/*',
			component: React.lazy( () => import( /* webpackChunkName: 'onboarding' */ './app' ) ),
		} );
	}
}
