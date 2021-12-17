import { useState, useContext, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import { ImportContext } from '../../../context/import-context/import-context-provider';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';
import PluginStatusItem from './components/plugin-status-item/plugin-status-item';

import Grid from 'elementor-app/ui/grid/grid';
import List from 'elementor-app/ui/molecules/list';

import './import-plugins-activation.scss';

import useQueryParams from 'elementor-app/hooks/use-query-params';
import useInstallPlugins from './hooks/use-install-plugins';

export default function ImportPluginsActivation() {
	const importContext = useContext( ImportContext ),
		navigate = useNavigate(),
		[ errorType, setErrorType ] = useState( '' ),
		{ bulk, ready, isDone } = useInstallPlugins( { plugins: importContext.data.plugins } ),
		{ referrer } = useQueryParams().getAll(),
		onCancelProcess = () => {
			importContext.dispatch( { type: 'SET_FILE', payload: null } );

			if ( 'kit-library' === referrer ) {
				navigate( '/kit-library' );
			} else {
				navigate( '/import' );
			}
		},
		onTryAgain = () => {
			importContext.dispatch( { type: 'SET_REQUIRED_PLUGINS', payload: [] } );
			navigate( '/import/plugins' );
		};

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
				<FileProcess
					info={ __( 'Activating plugins:', 'elementor' ) }
					errorType={ errorType }
					onDialogDismiss={ onCancelProcess }
					onDialogApprove={ onTryAgain }
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
