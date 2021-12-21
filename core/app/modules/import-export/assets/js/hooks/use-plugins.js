import { useState } from 'react';

export const PLUGINS_RESPONSE_MAP = Object.freeze( {
		INITIAL: 'initial',
		SUCCESS: 'success',
		ERROR: 'error',
	} );

export const PLUGIN_STATUS_MAP = Object.freeze( {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	NOT_INSTALLED: 'Not Installed',
} );

export default function usePlugins() {
	const getInitialState = () => ( {
			status: PLUGINS_RESPONSE_MAP.INITIAL,
			data: null,
		} ),
		[ response, setResponse ] = useState( getInitialState() ),
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

			if ( response.data ) {
				reset();
			}

			return new Promise( ( resolve, reject ) => {
				fetch( baseEndpoint + endpoint, data )
					.then( ( res ) => res.json() )
					.then( ( res ) => {
						setResponse( {
							status: PLUGINS_RESPONSE_MAP.SUCCESS,
							data: res,
						} );

						resolve( res );
					} )
					.catch( ( error ) => {
						setResponse( {
							status: PLUGINS_RESPONSE_MAP.ERROR,
							data: error,
						} );

						reject( error );
					} );
			} );
		},
		fetchData = ( slug ) => {
			return fetchRest( {
				method: 'GET',
				endpoint: slug,
			} );
		},
		install = ( slug ) => {
			slug = slug.split( '/' )[ 0 ];

			return fetchRest( {
				method: 'POST',
				body: {
					slug,
				},
			} );
		},
		activate = ( slug ) => {
			return fetchRest( {
				endpoint: slug,
				method: 'PUT',
				body: {
					status: PLUGIN_STATUS_MAP.ACTIVE,
				},
			} );
		},
		deactivate = ( slug ) => {
			return fetchRest( {
				endpoint: slug,
				method: 'PUT',
				body: {
					status: PLUGIN_STATUS_MAP.INACTIVE,
				},
			} );
		},
		remove = ( slug ) => {
			return fetchRest( {
				endpoint: slug,
				method: 'DELETE',
			} );
		},
		reset = () => setResponse( getInitialState() );

	return {
		response,
		pluginsActions: {
			fetch: fetchData,
			install,
			activate,
			deactivate,
			remove,
			reset,
		},
		PLUGINS_RESPONSE_MAP,
		PLUGIN_STATUS_MAP,
	};
}
