import { useState, useEffect } from 'react';

const PLUGINS_STATUS_MAP = Object.freeze( {
	INITIAL: 'initial',
	SUCCESS: 'success',
	ERROR: 'error',
} );

export default function usePlugins() {
	const getInitialState = () => ( {
			status: PLUGINS_STATUS_MAP.INITIAL,
			data: null,
		} ),
		[ pluginsState, setPluginsState ] = useState( getInitialState() ),
		baseEndpoint = elementorCommon.config.urls.rest + 'wp/v2/plugins/',
		fetchRest = ( { body, method, endpoint = '' } ) => {
			const data = {
				method,
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					'X-WP-Nonce': wpApiSettings.nonce,
				},
			};

			if ( body ) {
				data.body = JSON.stringify( body );
			}

			return fetch( baseEndpoint + endpoint, data ).then( ( response ) => response.json() );
		},
		get = () => {
			fetchRest( {
				method: 'GET',
			} )
			.then( ( res ) => {
				setPluginsState( {
					status: PLUGINS_STATUS_MAP.SUCCESS,
					data: {
						installed: res,
						active: res.filter( ( plugin ) => 'active' === plugin.status ),
					},
				} );
			} )
			.catch( ( error ) => {
				setPluginsState( {
					status: PLUGINS_STATUS_MAP.ERROR,
					data: error,
				} );
			} );
		},
		install = ( slug ) => {
			slug = slug.split( '/' )[ 0 ];

			fetchRest( {
				method: 'POST',
				body: {
					slug,
				},
			} )
			.then( ( res ) => {
				setPluginsState( {
					status: PLUGINS_STATUS_MAP.SUCCESS,
					data: res,
				} );
			} )
			.catch( ( error ) => {
				setPluginsState( {
					status: PLUGINS_STATUS_MAP.ERROR,
					data: error,
				} );
			} );
		},
		activate = ( slug ) => {
			fetchRest( {
				endpoint: slug,
				method: 'PUT',
				body: {
					status: 'active',
				},
			} )
			.then( ( res ) => {
				setPluginsState( {
					status: PLUGINS_STATUS_MAP.SUCCESS,
					data: res,
				} );
			} )
			.catch( ( error ) => {
				setPluginsState( {
					status: PLUGINS_STATUS_MAP.ERROR,
					data: error,
				} );
			} );
		},
		deactivate = ( slug ) => {
			fetchRest( {
				endpoint: slug,
				method: 'PUT',
				body: {
					status: 'inactive',
				},
			} )
				.then( ( res ) => {
					setPluginsState( {
						status: PLUGINS_STATUS_MAP.SUCCESS,
						data: res,
					} );
				} )
				.catch( ( error ) => {
					setPluginsState( {
						status: PLUGINS_STATUS_MAP.ERROR,
						data: error,
					} );
				} );
		},
		reset = () => setPluginsState( getInitialState() );

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
		pluginsState,
		pluginsActions: {
			get,
			install,
			activate,
			deactivate,
			reset,
		},
		PLUGINS_STATUS_MAP,
	};
}
