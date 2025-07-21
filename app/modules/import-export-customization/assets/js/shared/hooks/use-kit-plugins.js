import { useState, useEffect, useCallback } from 'react';

export default function useKitPlugins( { open, data } ) {
	const initialState = data?.includes?.includes( 'plugins' ) || false;

	const [ plugins, setPlugins ] = useState( {} );
	const [ pluginsList, setPluginsList ] = useState( {} );
	const [ isLoading, setIsLoading ] = useState( false );

	const requiredPlugins = [
		'elementor/elementor.php',
	];

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
				const pluginKey = plugin.plugin.endsWith( '.php' ) ? plugin.plugin : plugin.plugin + '.php';
				
				pluginsObject[ pluginKey ] = {
					name: plugin.name,
					plugin: pluginKey,
					pluginUri: plugin.plugin_uri,
					version: plugin.version,
				};
			} );

			setPluginsList( pluginsObject );

			let initialPluginsState = {};

			if ( data?.customization?.plugins ) {
				initialPluginsState = data.customization.plugins;
			} else {
				Object.keys( pluginsObject ).forEach( ( pluginKey ) => {
					initialPluginsState[ pluginKey ] = initialState;
				} );
			}

			requiredPlugins.forEach( ( pluginKey ) => {
				if ( initialPluginsState.hasOwnProperty( pluginKey ) ) {
					initialPluginsState[ pluginKey ] = true;
				}
			} );

			setPlugins( initialPluginsState );
		} catch {
			setPluginsList( {} );
			setPlugins( {} );
		} finally {
			setIsLoading( false );
		}
	}, [ data.includes, data.customization, initialState ] );

	useEffect( () => {
		if ( open ) {
			fetchPlugins();
		}
	}, [ open, fetchPlugins ] );

	const isRequiredPlugin = useCallback( ( pluginKey ) => {
		return requiredPlugins.includes( pluginKey );
	}, [] );

	const handleToggleChange = useCallback( ( settingKey ) => {
		if ( isRequiredPlugin( settingKey ) ) {
			return;
		}
		setPlugins( ( prev ) => ( {
			...prev,
			[ settingKey ]: ! prev[ settingKey ],
		} ) );
	}, [ isRequiredPlugin ] );

	const handleSelectAll = useCallback( () => {
		const nonRequiredPlugins = Object.keys( plugins ).filter( ( pluginKey ) => ! isRequiredPlugin( pluginKey ) );
		const allNonRequiredSelected = nonRequiredPlugins.every( ( pluginKey ) => plugins[ pluginKey ] );
		const newState = { ...plugins };
		nonRequiredPlugins.forEach( ( pluginKey ) => {
			newState[ pluginKey ] = ! allNonRequiredSelected;
		} );

		requiredPlugins.forEach( ( pluginKey ) => {
			if ( newState.hasOwnProperty( pluginKey ) ) {
				newState[ pluginKey ] = true;
			}
		} );

		setPlugins( newState );
	}, [ plugins, isRequiredPlugin ] );

	const getSelectedPlugins = useCallback( () => {
		const selectedPlugins = {};
		Object.entries( plugins ).forEach( ( [ pluginKey, isSelected ] ) => {
			selectedPlugins[ pluginKey ] = isSelected;
		} );
		return selectedPlugins;
	}, [ plugins ] );

	const nonRequiredPlugins = Object.keys( plugins ).filter( ( pluginKey ) => ! isRequiredPlugin( pluginKey ) );
	const isAllSelected = nonRequiredPlugins.length > 0 && nonRequiredPlugins.every( ( pluginKey ) => plugins[ pluginKey ] );
	const isIndeterminate = nonRequiredPlugins.some( ( pluginKey ) => plugins[ pluginKey ] ) && ! isAllSelected;

	return {
		plugins,
		pluginsList,
		isLoading,
		isRequiredPlugin,
		handleToggleChange,
		handleSelectAll,
		getSelectedPlugins,
		isAllSelected,
		isIndeterminate,
	};
}
