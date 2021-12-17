import { useEffect, useContext, useState } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';
import { ExportContext } from '../../../context/export-context/export-context-provider';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

import useKit from '../../../hooks/use-kit';

export default function ExportProcess() {
	const sharedContext = useContext( SharedContext ),
		exportContext = useContext( ExportContext ),
		navigate = useNavigate(),
		{ kitState, kitActions, KIT_STATUS_MAP } = useKit(),
		[ errorType, setErrorType ] = useState( '' ),
		onDialogDismiss = () => {
			exportContext.dispatch( { type: 'SET_DOWNLOAD_URL', payload: '' } );
			navigate( 'export' );
		},
		getExportedPluginsData = ( plugins ) => {
			const pluginsData = [];

			plugins.forEach( ( pluginData ) => {
				const { name, plugin, plugin_uri: pluginUri, version } = pluginData;

				pluginsData.push( {
					name,
					plugin,
					pluginUri,
					version,
				} );
			} );

			return pluginsData;
		},
		exportKit = () => {
			const { includes, kitInfo } = sharedContext.data;

			/*
				Adding the plugins just before the export process begins for not mixing the kit-content selection with the plugins.
				The plugins must be added to the includes items, otherwise they will not be exported.
				The plugins should always be added in order to include the Core plugin data in the kit.
			 */
			includes.push( 'plugins' );

			kitActions.export( {
				include: includes,
				kitInfo,
				plugins: getExportedPluginsData( exportContext.data.plugins ),
			} );
		};

	useEffect( () => {
		if ( exportContext.data.isExportProcessStarted ) {
			exportKit();
		} else {
			// When not starting from the main screen.
			navigate( '/export' );
		}
	}, [] );

	useEffect( () => {
		switch ( kitState.status ) {
			case KIT_STATUS_MAP.EXPORTED:
				exportContext.dispatch( { type: 'SET_EXPORTED_DATA', payload: kitState.data } );
				break;
			case KIT_STATUS_MAP.ERROR:
				setErrorType( kitState.data );
				break;
		}
	}, [ kitState.status ] );

	useEffect( () => {
		if ( exportContext.data.exportedData ) {
			navigate( 'export/complete' );
		}
	}, [ exportContext.data.exportedData ] );

	return (
		<Layout type="export">
			<FileProcess
				errorType={ errorType }
				onDialogApprove={ () => window.open( 'https://elementor.com/help/export-kit?utm_source=import-export&utm_medium=wp-dash&utm_campaign=learn', '_blank' ) }
				onDialogDismiss={ onDialogDismiss }
			/>
		</Layout>
	);
}
