import router from '@elementor/router';
import React from 'react';

const LazyApp = React.lazy( () =>
	import( '@elementor/onboarding' ).then( ( module ) => ( { default: module.App } ) ),
);

function setupUnexpectedExitHandler() {
	let hasUserExited = false;

	window.addEventListener( 'e-onboarding-user-exit', () => {
		hasUserExited = true;
	} );

	window.addEventListener( 'beforeunload', () => {
		if ( ! hasUserExited ) {
			// Server-side detection handles unexpected exits
		}
	} );
}

export default class EOnboarding {
	constructor() {
		setupUnexpectedExitHandler();

		router.addRoute( {
			path: '/onboarding/*',
			component: LazyApp,
		} );
	}
}
