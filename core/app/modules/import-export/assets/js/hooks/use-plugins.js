import { useQuery, useMutation } from 'react-query';

const QUERY_KEY = 'e-app-use-plugins',
	baseEndpoint = elementorCommon.config.urls.rest + 'wp/v2/plugins/',
	fetchPlugins = ( { body, method, endpoint = '' } ) => {
		const config = {
			method,
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				'X-WP-Nonce': wpApiSettings.nonce,
			},
		};

		if ( body ) {
			config.body = JSON.stringify( body );
		}

		return fetch( baseEndpoint + endpoint, config )
			.then( ( response ) => response.json() );
	};

export default function usePlugins() {
	const { data, status } = useQuery( QUERY_KEY, fetchPlugins ),
		createMutation = ( callback ) => {
			const { mutate } = useMutation( callback );

			return mutate;
		},
		install = createMutation( ( slug ) => {
			slug = slug.split( '/' )[ 0 ];

			fetchPlugins( {
				method: 'POST',
				body: {
					slug,
				},
			} );
		} ),
		activate = createMutation( ( slug ) => {
			slug = slug.split( '/' )[ 0 ];

			fetchPlugins( {
				endpoint: slug,
				method: 'PUT',
				body: {
					status: 'active',
				},
			} );
		} ),
		deactivate = createMutation( ( slug ) => {
			slug = slug.split( '/' )[ 0 ];

			fetchPlugins( {
				endpoint: slug,
				method: 'PUT',
				body: {
					status: 'inactive',
				},
			} );
		} );

	return {
		pluginsData: data,
		pluginsStatus: status,
		pluginsActions: {
			install,
			activate,
			deactivate,
		},
	};
}
