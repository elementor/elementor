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
		[ failedPlugins, setFailedPlugins ] = useState( [] );

	useEffect( () => {
		console.log( 'succeeded', succeeded );
		console.log( 'failedPlugins', failedPlugins );
		console.log( 'readyPlugins', readyPlugins );
		if ( plugins.length && ( plugins.length === readyPlugins.length ) ) {
			console.log( 'ALL READY!!!' );
			setIsDone( true );
			// When all plugins are installed and activated.
			//context.dispatch( { type: 'SET_FAILED_PLUGINS', payload: failedPlugins } );

			//navigate( '/import/process' );
		} else if ( plugins.length && isPluginsFetched ) {
			const nextPluginToInstallIndex = readyPlugins.length;

			console.log( '' );
			console.log( 'nextPluginToInstallIndex', nextPluginToInstallIndex );
			console.log( 'readyPlugins', [ ...readyPlugins ] );

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
			console.log( 'going to process with action', action, { ...currentPlugin } );

			// TODO: temp - remove!
			if ( 'media-cleaner/media-cleaner' === currentPlugin.plugin ) {
				//plugin = 'medsgfdsfd/dsfsdfsdf';
			}

			//plugin = 'medsgfdsfd/dsfsdfsdf';

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

				/*
					In case that the widget was installed it will be inactive after the installation.
					Therefore, after installation it should be activated.
				 */
				pluginsActions.activate( pluginsState.data.plugin );
			}
		}
	}, [ pluginsState.status ] );

	useEffect( () => {
		console.log( '### actionStatus: ', actionStatus );
		if ( 'failed' === actionStatus ) {
			setFailedPlugins( ( prevState ) => [ ...prevState, pluginsState.data ] );
		}

		if ( 'activated' === actionStatus ) {
			setSucceeded( ( prevState ) => [ ...prevState, pluginsState.data ] );
		}

		if ( 'activated' === actionStatus || 'failed' === actionStatus ) {
			console.log( 'adding to ready plugins: ', { ...pluginsState.data } );
			setReadyPlugins( ( prevState ) => [ ...prevState, pluginsState.data ] );
		}
		console.log( '' );
	}, [ actionStatus ] );

	return {
		isDone,
		pluginsOnProcess,
		readyPlugins,
		installedPlugins: {
			succeeded,
			failed: failedPlugins,
		},
	};
}
