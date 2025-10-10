import { useState, useEffect, useCallback } from 'react';

export default function useKitPlugins( { open } ) {
	const [ pluginsList, setPluginsList ] = useState( {} );
	const [ isLoading, setIsLoading ] = useState( false );

	const fetchPlugins = useCallback( async () => {
		setIsLoading( true );
		try {
			const requestUrl = `${ elementorCommon.config.urls.rest }wp/v2/plugins/`;
			const response = await fetch( requestUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': window.wpApiSettings?.nonce || '',
				},
			} );

			const result = await response.json();
			if ( ! response.ok ) {
				const errorMessage = result?.message || `HTTP error! Status: ${ response.status }`;
				throw new Error( errorMessage );
			}

			if ( ! Array.isArray( result ) ) {
				return;
			}

			const pluginsObject = {};
			result.forEach( ( plugin ) => {
				pluginsObject[ plugin.plugin ] = {
					name: plugin.name,
					plugin: plugin.plugin,
					pluginUri: plugin.plugin_uri,
					version: plugin.version,
				};
			} );

			setPluginsList( pluginsObject );
		} catch {
			setPluginsList( {} );
		} finally {
			setIsLoading( false );
		}
	}, [] );

	useEffect( () => {
		if ( open ) {
			fetchPlugins();
		}
	}, [ open, fetchPlugins ] );

	return {
		pluginsList,
		isLoading,
	};
}
