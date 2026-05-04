import router from '@elementor/router';
import React from 'react';

const LazyApp = React.lazy( () =>
	import( '@elementor/site-builder' ).then( ( module ) => ( { default: module.App } ) ),
);

export default class SiteBuilder {
	constructor() {
		router.addRoute( {
			path: '/site-builder/*',
			component: LazyApp,
		} );
	}
}
