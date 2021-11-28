import { useState, useContext, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';
import PluginStatusItem from './components/plugin-status-item/plugin-status-item';

import Grid from 'elementor-app/ui/grid/grid';
import Heading from 'elementor-app/ui/atoms/heading';
import List from 'elementor-app/ui/molecules/list';

import './import-plugins-activation.scss';

export default function ImportPluginsActivation() {
	const context = useContext( Context ),
		navigate = useNavigate(),
		[ pluginsOnProcess, setPluginsOnProcess ] = useState( [] ),
		[ readyPlugins, setReadyPlugins ] = useState( [] ),
		[ errorType, setErrorType ] = useState( '' ),
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
		// When all plugins are activated/installed.
		if ( context.data.plugins.length === readyPlugins.length ) {
			console.log( 'ALL READY!' );
		} else {
			const nextPluginToInstallIndex = readyPlugins.length;

			setPluginsOnProcess( ( prevState ) => [ ...prevState, context.data.plugins[ nextPluginToInstallIndex ] ] );
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
						<Heading className="e-app-import-plugins-activation__heading" variant="h3" tag="h3">
							{ __( 'Installing plugins:', 'elementor' ) }
						</Heading>

						<List>
							{
								pluginsOnProcess.map( ( { name, plugin, status } ) => (
									<List.Item className="e-app-import-plugins-activation__plugin-status-item" key={ name }>
										<Grid container alignItems="center">
											<PluginStatusItem
												name={ name }
												slug={ plugin }
												status={ status }
												onReady={ ( pluginName ) => setReadyPlugins( ( prevState ) => [ ...prevState, pluginName ] ) }
											/>
										</Grid>
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
