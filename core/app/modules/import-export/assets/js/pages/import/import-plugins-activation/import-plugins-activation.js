import { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';
import PluginStatusItem from './components/plugin-status-item/plugin-status-item';

import Grid from 'elementor-app/ui/grid/grid';
import Text from 'elementor-app/ui/atoms/text';
import List from 'elementor-app/ui/molecules/list';

import './import-plugins-activation.scss';

const PLUGINS_INSTALLATION_LIST_MAX_ITEMS = 4;

export default function ImportPluginsActivation() {
	const context = useContext( Context ),
		navigate = useNavigate(),
		[ pluginsOnProcess, setPluginsOnProcess ] = useState( [] ),
		[ readyPlugins, setReadyPlugins ] = useState( [] ),
		[ failedPlugins, setFailedPlugins ] = useState( [] ),
		[ errorType, setErrorType ] = useState( '' ),
		onPluginStatusItemReady = useCallback( ( pluginName, processStatus ) => {
			// Saving the failed plugins on a separate list to display them at the end of the process.
			if ( 'failed' === processStatus ) {
				setFailedPlugins( ( prevState ) => [ ...prevState, pluginName ] );
			}

			setReadyPlugins( ( prevState ) => [ ...prevState, pluginName ] );
		}, [] ),
		onCancelProcess = () => {
			// context.dispatch( { type: 'SET_FILE', payload: null } );
			//
			// if ( 'kit-library' === referrer ) {
			// 	navigate( '/kit-library' );
			// } else {
			// 	navigate( '/import' );
			// }
		};

	useEffect( () => {
		if ( context.data.plugins.length === readyPlugins.length ) {
			// When all plugins are installed and activated.
			context.dispatch( { type: 'SET_FAILED_PLUGINS', payload: failedPlugins } );

			navigate( '/import/process' );
		} else {
			const nextPluginToInstallIndex = readyPlugins.length;

			setPluginsOnProcess( ( prevState ) => {
				const currentPluginsOnProcess = [ ...prevState, context.data.plugins[ nextPluginToInstallIndex ] ];

				if ( currentPluginsOnProcess.length > PLUGINS_INSTALLATION_LIST_MAX_ITEMS ) {
					currentPluginsOnProcess.shift();
				}

				return currentPluginsOnProcess;
			} );
		}
	}, [ readyPlugins ] );

	useEffect( () => {
		if ( ! context.data.plugins.length ) {
			navigate( '/import/' );
		}
	}, [ context.data.plugins ] );

	return (
		<Layout type="import">
			<section className="e-app-import-plugins-activation">
				<FileProcess errorType={ errorType } onDialogDismiss={ onCancelProcess } />

				<Grid container justify="center">
					<Grid item className="e-app-import-plugins-activation__installing-plugins">
						<Text className="e-app-import-plugins-activation__heading" variant="lg">
							{ __( 'Installing plugins:', 'elementor' ) }
						</Text>

						<List>
							{
								pluginsOnProcess.map( ( { name, plugin, status } ) => (
									<List.Item className="e-app-import-plugins-activation__plugin-status-item" key={ name }>
										<PluginStatusItem
											name={ name }
											slug={ plugin }
											status={ status }
											onReady={ onPluginStatusItemReady }
										/>
									</List.Item>
								) )
							}
						</List>
					</Grid>
				</Grid>
			</section>
		</Layout>
	);
}
