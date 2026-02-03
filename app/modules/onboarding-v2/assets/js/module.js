import router from '@elementor/router';
import { App, init } from '@elementor/onboarding';

export default class OnboardingV2 {
	constructor() {
		init();

		router.addRoute( {
			path: '/onboarding-v2/*',
			component: App,
		} );
	}
}
