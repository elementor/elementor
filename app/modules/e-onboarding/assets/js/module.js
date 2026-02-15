import router from '@elementor/router';
import React from 'react';

const LazyApp = React.lazy( () =>
	import( '@elementor/onboarding' ).then( ( module ) => ( { default: module.App } ) ),
);

export default class EOnboarding {
	constructor() {
		router.addRoute( {
			path: '/onboarding/*',
			component: LazyApp,
		} );
	}
}
