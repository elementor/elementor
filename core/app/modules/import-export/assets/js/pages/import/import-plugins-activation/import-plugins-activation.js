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

import useInstallPlugins from '../../../hooks/use-install-plugins';

export default function ImportPluginsActivation() {
	const context = useContext( Context ),
		navigate = useNavigate(),
		[ errorType, setErrorType ] = useState( '' ),
		{ pluginsOnProcess, readyPlugins } = useInstallPlugins( { plugins: context.data.plugins } ),
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
		if ( ! context.data.plugins.length ) {
			navigate( '/import/' );
		}
	}, [ context.data.plugins ] );

	console.log( 'pluginsOnProcess', pluginsOnProcess );

	return (
		<Layout type="import">
			<section className="e-app-import-plugins-activation">
				<FileProcess errorType={ errorType } onDialogDismiss={ onCancelProcess } />

				<Grid container justify="center">
					<Grid item className="e-app-import-plugins-activation__installing-plugins">
						<Text className="e-app-import-plugins-activation__heading" variant="lg">
							{ __( 'Installing plugins:', 'elementor' ) }
						</Text>

						{
							! ! pluginsOnProcess?.length &&
							<List>
								{
									pluginsOnProcess.map( ( plugin ) => (
										<List.Item className="e-app-import-plugins-activation__plugin-status-item" key={ plugin.name }>
											<PluginStatusItem
												name={ plugin.name }
												status={ plugin.status }
											/>
										</List.Item>
									) )
								}
							</List>
						}
					</Grid>
				</Grid>
			</section>
		</Layout>
	);
}
