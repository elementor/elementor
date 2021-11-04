import { useState, useEffect } from 'react';

const initialState = {
	installed: [],
	active: [],
};

export default function usePlugins() {
	const [ plugins, setPlugins ] = useState( initialState ),
		get = () => {
			fetch( elementorCommon.config.urls.rest + 'wp/v2/plugins', {
				headers: {
					'X-WP-Nonce': wpApiSettings.nonce,
				},
				method: 'get',
			} ).then( ( response ) => {
				response.json().then( ( pluginsResponse ) => {
					setPlugins( {
						installed: pluginsResponse,
						active: pluginsResponse.filter( ( plugin ) => 'active' === plugin.status ),
					} );
				} );
			} ).catch( ( error ) => {
				console.log( error );
			} );
		},
		install = () => {},
		activate = () => {},
		deactivate = () => {};

	useEffect( () => {
		get();
	}, [] );

	// setAjax( {
	// 	type: 'get',
	// 	url: elementorCommon.config.urls.rest + 'wp/v2/plugins',
	// 	headers: {
	// 		'X-WP-Nonce': wpApiSettings.nonce,
	// 	},
	// } );

	// useEffect( () => {
	// 	console.log( 'ajaxState', ajaxState );
	// 	if ( 'success' === ajaxState.status ) {
	// 		console.log( 'ajaxState', ajaxState );
	// 	}
	// }, [ ajaxState.status ] );

	return {
		pluginsState: plugins,
		pluginsActions: {
			get,
			install,
			activate,
			deactivate,
		},
	};
}
