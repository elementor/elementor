import { useState, useEffect } from 'react';

import { arrayToObjectByKey } from 'elementor-app/utils/utils.js';

import usePlugins from './use-plugins';

export default function useInstallPlugins( { plugins = [], bulks = 5 } ) {
	const { pluginsState, pluginsActions, PLUGINS_STATUS_MAP } = usePlugins(),
		[ isPluginsFetched, setIsPluginsFetched ] = useState( false ),
		[ isDone, setIsDone ] = useState( false ),
		[ pluginsOnProcess, setPluginsOnProcess ] = useState( [] ),
		[ readyPlugins, setReadyPlugins ] = useState( [] ),
		[ actionStatus, setActionStatus ] = useState( '' ),
		[ currentPlugin, setCurrentPlugin ] = useState( null ),
		[ succeeded, setSucceeded ] = useState( [] ),
		[ failed, setFailedPlugins ] = useState( [] );

	useEffect( () => {
		if ( plugins.length && ( plugins.length === readyPlugins.length ) ) {
			setIsDone( true );
		} else if ( plugins.length && isPluginsFetched ) {
			const nextPluginToInstallIndex = readyPlugins.length;

			setPluginsOnProcess( ( prevState ) => {
				const currentPluginsOnProcess = [ ...prevState, plugins[ nextPluginToInstallIndex ] ];

				if ( currentPluginsOnProcess.length > bulks ) {
					currentPluginsOnProcess.shift();
				}

				return currentPluginsOnProcess;
			} );
		}
	}, [ readyPlugins, isPluginsFetched ] );

	useEffect( () => {
		if ( pluginsOnProcess.length ) {
			const nextPluginToProcess = pluginsOnProcess[ readyPlugins.length ];

			setActionStatus( '' );

			setCurrentPlugin( nextPluginToProcess );
		}
	}, [ pluginsOnProcess ] );

	useEffect( () => {
		if ( currentPlugin ) {
			const action = 'inactive' === currentPlugin.status ? 'activate' : 'install';

			// TODO: temp - remove!
			if ( 'media-cleaner/media-cleaner' === currentPlugin.plugin ) {
				//plugin = 'medsgfdsfd/dsfsdfsdf';
			}

			pluginsActions[ action ]( currentPlugin.plugin );
		}
	}, [ currentPlugin ] );

	useEffect( () => {
		if ( PLUGINS_STATUS_MAP.SUCCESS === pluginsState.status ) {
			if ( Array.isArray( pluginsState.data ) ) {
				setIsPluginsFetched( true );
			} else if ( ! pluginsState.data.hasOwnProperty( 'plugin' ) ) {
				setActionStatus( 'failed' );
			} else if ( 'active' === pluginsState.data.status ) {
				setActionStatus( 'activated' );
			} else if ( 'inactive' === pluginsState.data.status ) {
				setActionStatus( 'installed' );

				// In case that the widget was installed it will be inactive after the installation and therefore should be activated manually.
				pluginsActions.activate( pluginsState.data.plugin );
			}
		}
	}, [ pluginsState.status ] );

	useEffect( () => {
		if ( 'activated' === actionStatus || 'failed' === actionStatus ) {
			if ( 'failed' === actionStatus ) {
				setFailedPlugins( ( prevState ) => [ ...prevState, pluginsState.data ] );
			}

			if ( 'activated' === actionStatus ) {
				setSucceeded( ( prevState ) => [ ...prevState, pluginsState.data ] );
			}

			setReadyPlugins( ( prevState ) => [ ...prevState, pluginsState.data ] );
		}
	}, [ actionStatus ] );

	return {
		isDone,
		pluginsOnProcess,
		installedPlugins: {
			succeeded,
			failed,
		},
	};
}
