import { useState } from 'react';

const PLUGINS_STATUS_MAP = Object.freeze( {
	INITIAL: 'initial',
	FETCHED: 'fetched',
	ERROR: 'error',
} );

const initialState = {
	status: PLUGINS_STATUS_MAP.INITIAL,
	data: {
		installed: [],
		active: [],
	},
};

export default function usePlugins() {
	const [ pluginsState, setPluginsState ] = useState( initialState ),
		get = () => {
			fetch( elementorCommon.config.urls.rest + 'wp/v2/plugins', {
				headers: {
					'X-WP-Nonce': wpApiSettings.nonce,
				},
				method: 'get',
			} ).then( ( response ) => {
				response.json().then( ( pluginsResponse ) => {
					setPluginsState( {
						status: PLUGINS_STATUS_MAP.FETCHED,
						data: {
							installed: pluginsResponse,
							active: pluginsResponse.filter( ( plugin ) => 'active' === plugin.status ),
						},
					} );
				} );
			} ).catch( ( error ) => {
				setPluginsState( {
					status: PLUGINS_STATUS_MAP.ERROR,
					data: error,
				} );
			} );
		},
		install = () => {},
		activate = () => {},
		deactivate = () => {};

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
		},
		PLUGINS_STATUS_MAP,
	};
}
