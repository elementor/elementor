import { useState, useEffect } from 'react';

import usePlugins from './use-plugins';

export default function useInstallPlugins( { plugins = [], bulkMaxItems = 5 } ) {
	const { pluginsState, pluginsActions, PLUGINS_STATUS_MAP } = usePlugins(),
		[ isPluginsFetched, setIsPluginsFetched ] = useState( false ),
		[ isDone, setIsDone ] = useState( false ),
		[ bulk, setBulk ] = useState( [] ),
		[ ready, setReady ] = useState( [] ),
		[ actionStatus, setActionStatus ] = useState( '' ),
		[ currentPlugin, setCurrentPlugin ] = useState( null ),
		getBulk = () => {
			if ( bulk.length > bulkMaxItems ) {
				// Getting a bulk for display, when needed to display only X plugins data that are in process.
				return bulk.slice( bulk.length - bulkMaxItems, bulk.length );
			}

			return bulk;
		};

	// Setting the next plugin to activate/install and checking when all plugins ar ready.
	useEffect( () => {
		if ( plugins.length ) {
			if ( ready.length === plugins.length ) {
				setIsDone( true );
			} else if ( isPluginsFetched ) {
				const nextPluginToInstallIndex = ready.length;

				setCurrentPlugin( plugins[ nextPluginToInstallIndex ] );
			}
		}
	}, [ ready, isPluginsFetched ] );

	// Activating/installing the current plugin.
	useEffect( () => {
		if ( currentPlugin ) {
			const action = 'inactive' === currentPlugin.status ? 'activate' : 'install';

			pluginsActions[ action ]( currentPlugin.plugin );
		}
	}, [ currentPlugin ] );

	// Status Updater.
	useEffect( () => {
		if ( PLUGINS_STATUS_MAP.SUCCESS === pluginsState.status ) {
			const { data } = pluginsState;

			if ( Array.isArray( data ) ) {
				// When the data type is an Array it means that the plugins data was fetched.
				setIsPluginsFetched( true );
			} else if ( ! data.hasOwnProperty( 'plugin' ) ) {
				setActionStatus( 'failed' );
			} else if ( 'active' === data.status ) {
				setActionStatus( 'activated' );
			} else if ( 'inactive' === data.status ) {
				setActionStatus( 'installed' );
			}
		} else if ( PLUGINS_STATUS_MAP.ERROR === pluginsState.status ) {
			setActionStatus( 'failed' );
		}
	}, [ pluginsState.status ] );

	// Actions after data response.
	useEffect( () => {
		if ( actionStatus ) {
			const pluginData = 'failed' === actionStatus ? { ...currentPlugin, status: 'failed' } : pluginsState.data;

			// Updating the current plugin status in the bulk.
			setBulk( ( prevState ) => {
				const processedPlugins = [ ...prevState ];

				processedPlugins[ ready.length ] = pluginData;

				return processedPlugins;
			} );

			if ( 'activated' === actionStatus || 'failed' === actionStatus ) {
				setReady( ( prevState ) => [ ...prevState, pluginData ] );
			} else if ( 'installed' === actionStatus ) {
				// In case that the widget was installed it will be inactive after the installation and therefore should be activated manually.
				setCurrentPlugin( pluginData );
			}

			// Reset the actionStatus value for the next iteration.
			setActionStatus( '' );
		}
	}, [ actionStatus ] );

	return {
		isDone,
		ready,
		bulk: getBulk(),
		isError: PLUGINS_STATUS_MAP.ERROR === pluginsState.status,
	};
}
