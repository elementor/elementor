import { useState, useEffect } from 'react';

import { arrayToObjectByKey } from 'elementor-app/utils/utils.js';

import usePlugins from './use-plugins';

export default function useInstallPlugins( { plugins = [], bulks = 3 } ) {
	const { pluginsState, pluginsActions, PLUGINS_STATUS_MAP } = usePlugins(),
		[ isPluginsFetched, setIsPluginsFetched ] = useState( false ),
		[ isDone, setIsDone ] = useState( false ),
		[ pluginsOnProcess, setPluginsOnProcess ] = useState( [] ),
		[ ready, setReady ] = useState( [] ),
		[ actionStatus, setActionStatus ] = useState( '' ),
		[ currentPlugin, setCurrentPlugin ] = useState( null ),
		[ succeeded, setSucceeded ] = useState( [] ),
		[ failed, setFailedPlugins ] = useState( [] );

	useEffect( () => {
		if ( plugins.length && ( plugins.length === ready.length ) ) {
			console.log( 'ALL READY!!!' );
			setIsDone( true );
		} else if ( plugins.length && isPluginsFetched ) {
			const nextPluginToInstallIndex = ready.length;

			setCurrentPlugin( plugins[ nextPluginToInstallIndex ] );
		}
	}, [ ready, isPluginsFetched ] );

	useEffect( () => {
		if ( currentPlugin ) {
			console.log( 'currentPlugin', currentPlugin );
			const action = 'inactive' === currentPlugin.status ? 'activate' : 'install';

			// TODO: temp - remove!
			if ( 'media-cleaner/media-cleaner' === currentPlugin.plugin ) {
				//plugin = 'medsgfdsfd/dsfsdfsdf';
			}

			pluginsActions[ action ]( currentPlugin.plugin );
		}
	}, [ currentPlugin ] );

	// Status Updater.
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
			}
		}
	}, [ pluginsState.status ] );

	// Actions after data response.
	useEffect( () => {
		console.log( '### actionStatus', actionStatus );
		if ( 'activated' === actionStatus || 'failed' === actionStatus || 'installed' === actionStatus ) {
			setPluginsOnProcess( ( prevState ) => {
				const processedPlugins = [ ...prevState ];

				processedPlugins[ ready.length ] = pluginsState.data;

				return processedPlugins;
			} );

			if ( 'installed' === actionStatus ) {
				// In case that the widget was installed it will be inactive after the installation and therefore should be activated manually.
				setCurrentPlugin( pluginsState.data );
			} else if ( 'activated' === actionStatus ) {
				setSucceeded( ( prevState ) => [ ...prevState, pluginsState.data ] );
			} else if ( 'failed' === actionStatus ) {
				setFailedPlugins( ( prevState ) => [ ...prevState, pluginsState.data ] );
			}

			if ( 'activated' === actionStatus || 'failed' === actionStatus ) {
				setReady( ( prevState ) => [ ...prevState, pluginsState.data ] );
			}

			// Reset the actionStatus value for the next iteration.
			setActionStatus( '' );
		}
	}, [ actionStatus ] );

	return {
		isDone,
		pluginsOnProcess: pluginsOnProcess.length > bulks ? pluginsOnProcess.slice( pluginsOnProcess.length - bulks, pluginsOnProcess.length ) : pluginsOnProcess,
		ready,
		installedPlugins: {
			succeeded,
			failed,
		},
	};
}
