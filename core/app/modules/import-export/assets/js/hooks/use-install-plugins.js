import { useState, useEffect } from 'react';

import { arrayToObjectByKey } from 'elementor-app/utils/utils.js';

import usePlugins from './use-plugins';

export default function useInstallPlugins( { plugins = [], bulks = 5 } ) {
	const { pluginsState, pluginsActions, PLUGINS_STATUS_MAP } = usePlugins(),
		[ isDone, setIsDone ] = useState( false ),
		[ pluginOnProcess, setPluginOnProcess ] = useState( [] ),
		[ readyPlugins, setReadyPlugins ] = useState( [] ),
		[ actionStatus, setActionStatus ] = useState( '' ),
		[ failedPlugins, setFailedPlugins ] = useState( [] );

	useEffect( () => {
		if ( pluginOnProcess.length ) {
			console.log( 'pluginOnProcess', pluginOnProcess );
			pluginOnProcess.forEach( ( { name, plugin, status } ) => {
				const action = 'inactive' === status ? 'activate' : 'install';

				// TODO: temp - remove!
				if ( 'media-cleaner/media-cleaner' === plugin ) {
					//plugin = 'medsgfdsfd/dsfsdfsdf';
				}

				//plugin = 'medsgfdsfd/dsfsdfsdf';

				pluginsActions[ action ]( plugin );
			} );
		}
	}, [ pluginOnProcess ] );

	useEffect( () => {
		if ( plugins.length && ( plugins.length === readyPlugins.length ) ) {
			// When all plugins are installed and activated.
			//context.dispatch( { type: 'SET_FAILED_PLUGINS', payload: failedPlugins } );

			//navigate( '/import/process' );
		} else {
			const nextPluginToInstallIndex = readyPlugins.length;

			setPluginOnProcess( ( prevState ) => {
				const currentPluginsOnProcess = [ ...prevState, plugins[ nextPluginToInstallIndex ] ];

				if ( currentPluginsOnProcess.length > bulks ) {
					currentPluginsOnProcess.shift();
				}

				return currentPluginsOnProcess;
			} );
		}
	}, [ readyPlugins ] );

	useEffect( () => {
		if ( PLUGINS_STATUS_MAP.SUCCESS === pluginsState.status ) {
			if ( ! pluginsState.data.hasOwnProperty( 'plugin' ) ) {
				setActionStatus( 'failed' );
			} else if ( 'active' === pluginsState.data.status ) {
				setActionStatus( 'activated' );
			} else if ( 'inactive' === pluginsState.data.status ) {
				setActionStatus( 'installed' );

				/*
					In case that the widget was installed it will be inactive after the installation.
					Therefore, the actions should be reset and the plugin should be activated.
				 */
				pluginsActions.reset();

				pluginsActions.activate( slug );
			}
		}
	}, [ pluginsState.status ] );

	useEffect( () => {
		pluginOnProcess.forEach( ( { name, plugin, status } ) => {
			// Saving the failed plugins on a separate list to display them at the end of the process.
			if ( 'failed' === actionStatus ) {
				setFailedPlugins( ( prevState ) => [ ...prevState, name ] );
			}

			setReadyPlugins( ( prevState ) => [ ...prevState, name ] );
		} );
	}, [ actionStatus ] );

	return {
		isDone,
		pluginOnProcess,
		readyPlugins,
	};
}
