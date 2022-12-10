import { useContext, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import { ImportContext } from '../../../context/import-context/import-context-provider';
import { SharedContext } from '../../../context/shared-context/shared-context-provider';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';
import PluginStatusItem from './components/plugin-status-item/plugin-status-item';

import Grid from 'elementor-app/ui/grid/grid';
import List from 'elementor-app/ui/molecules/list';

import './import-plugins-activation.scss';

import useInstallPlugins from './hooks/use-install-plugins';

export default function ImportPluginsActivation() {
	const importContext = useContext( ImportContext ),
		sharedContext = useContext( SharedContext ),
		navigate = useNavigate(),
		{ bulk, ready, isDone } = useInstallPlugins( { plugins: importContext.data.plugins } );

	// In case there are no plugins to import.
	useEffect( () => {
		if ( ! importContext.data.plugins.length ) {
			navigate( '/import/' );
		}
	}, [ importContext.data.plugins ] );

	// When import plugins process is done.
	useEffect( () => {
		if ( isDone ) {
			importContext.dispatch( { type: 'SET_IMPORTED_PLUGINS', payload: ready } );
			importContext.dispatch( { type: 'SET_PLUGINS_STATE', payload: 'success' } );
			sharedContext.dispatch( { type: 'SET_CURRENT_PAGE_NAME', payload: ImportPluginsActivation.name } );
		}
	}, [ isDone ] );

	// Once the imported plugins data was updated.
	useEffect( () => {
		if ( importContext.data.importedPlugins.length ) {
			navigate( '/import/process' );
		}
	}, [ importContext.data.importedPlugins ] );

	return (
		<Layout type="import">
			<section className="e-app-import-plugins-activation">
				<FileProcess info={ __( 'Activating plugins:', 'elementor' ) } />

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
