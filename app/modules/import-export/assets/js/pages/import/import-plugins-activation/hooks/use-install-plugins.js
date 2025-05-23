import { useState, useEffect, useMemo } from 'react';

import usePlugins, { PLUGINS_RESPONSE_MAP, PLUGIN_STATUS_MAP } from '../../../../hooks/use-plugins';

export const ACTION_STATUS_MAP = Object.freeze( {
	ACTIVATED: 'activated',
	INSTALLED: 'installed',
	FAILED: 'failed',
} );

export default function useInstallPlugins( { plugins = [], bulkMaxItems = 5 } ) {
	const { response, pluginsActions } = usePlugins(),
		[ isPluginsFetched, setIsPluginsFetched ] = useState( false ),
		[ isDone, setIsDone ] = useState( false ),
		[ bulk, setBulk ] = useState( [] ),
		[ ready, setReady ] = useState( [] ),
		[ actionStatus, setActionStatus ] = useState( '' ),
		[ currentPlugin, setCurrentPlugin ] = useState( null ),
		isError = PLUGINS_RESPONSE_MAP.ERROR === response.status,
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
			const runAction = PLUGIN_STATUS_MAP.INACTIVE === currentPlugin.status ? pluginsActions.activate : pluginsActions.install;

			runAction( currentPlugin.plugin );
		}
	}, [ currentPlugin ] );

	// Status Updater.
	useEffect( () => {
		if ( PLUGINS_RESPONSE_MAP.SUCCESS === response.status ) {
			const { data } = response;

			if ( Array.isArray( data ) ) {
				// When the data type is an Array it means that the plugins data was fetched.
				setIsPluginsFetched( true );
			} else if ( ! Object.prototype.hasOwnProperty.call( data, 'plugin' ) ) {
				setActionStatus( ACTION_STATUS_MAP.FAILED );
			} else if ( PLUGIN_STATUS_MAP.ACTIVE === data.status ) {
				setActionStatus( ACTION_STATUS_MAP.ACTIVATED );
			} else if ( PLUGIN_STATUS_MAP.INACTIVE === data.status ) {
				setActionStatus( ACTION_STATUS_MAP.INSTALLED );
			}
		} else if ( PLUGINS_RESPONSE_MAP.ERROR === response.status ) {
			setActionStatus( ACTION_STATUS_MAP.FAILED );
		}
	}, [ response.status ] );

	// Actions after data response.
	useEffect( () => {
		if ( actionStatus ) {
			const pluginData = ACTION_STATUS_MAP.FAILED === actionStatus ? { ...currentPlugin, status: ACTION_STATUS_MAP.FAILED } : response.data;

			// Updating the current plugin status in the bulk.
			setBulk( ( prevState ) => {
				const processedPlugins = [ ...prevState ];

				processedPlugins[ ready.length ] = pluginData;

				return processedPlugins;
			} );

			if ( ACTION_STATUS_MAP.ACTIVATED === actionStatus || ACTION_STATUS_MAP.FAILED === actionStatus ) {
				// After the plugin process was finished.
				setReady( ( prevState ) => [ ...prevState, pluginData ] );
			} else if ( ACTION_STATUS_MAP.INSTALLED === actionStatus ) {
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
		bulk: useMemo( () => getBulk(), [ bulk ] ),
		isError,
	};
}
