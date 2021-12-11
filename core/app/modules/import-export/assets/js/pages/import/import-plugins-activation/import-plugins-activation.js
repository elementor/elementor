import { useState, useContext, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';
import PluginStatusItem from './components/plugin-status-item/plugin-status-item';

import Grid from 'elementor-app/ui/grid/grid';
import List from 'elementor-app/ui/molecules/list';

import './import-plugins-activation.scss';

import useInstallPlugins from '../../../hooks/use-install-plugins';

export default function ImportPluginsActivation() {
	const context = useContext( Context ),
		navigate = useNavigate(),
		[ errorType, setErrorType ] = useState( '' ),
		{ bulk, ready, isDone } = useInstallPlugins( { plugins: context.data.plugins } ),
		onCancelProcess = () => {
			// context.dispatch( { type: 'SET_FILE', payload: null } );
			//
			// if ( 'kit-library' === referrer ) {
			// 	navigate( '/kit-library' );
			// } else {
			// 	navigate( '/import' );
			// }
		};

	// In case there are no plugins to import.
	useEffect( () => {
		if ( ! context.data.plugins.length ) {
			navigate( '/import/' );
		}
	}, [ context.data.plugins ] );

	// When import plugins process is done.
	useEffect( () => {
		if ( isDone ) {
			context.dispatch( { type: 'SET_IMPORTED_PLUGINS', payload: ready } );
		}
	}, [ isDone ] );

	// Once the imported plugins data was updated.
	useEffect( () => {
		if ( context.data.importedPlugins.length ) {
			navigate( '/import/process' );
		}
	}, [ context.data.importedPlugins ] );

	return (
		<Layout type="import">
			<section className="e-app-import-plugins-activation">
				<FileProcess
					info={ __( 'Activating plugins:', 'elementor' ) }
					errorType={ errorType }
					onDialogDismiss={ onCancelProcess }
				/>

				<Grid container justify="center">
					<Grid item className="e-app-import-plugins-activation__installing-plugins">
						{
							! ! bulk?.length &&
							<List>
								{
									bulk.map( ( plugin ) => (
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
