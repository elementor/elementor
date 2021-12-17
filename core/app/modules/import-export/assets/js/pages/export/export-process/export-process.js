import { useEffect, useContext, useState } from 'react';
import { useNavigate } from '@reach/router';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

import { Context } from '../../../context/context-provider';

import useKit from '../../../hooks/use-kit';

export default function ExportProcess() {
	const { kitState, kitActions, KIT_STATUS_MAP } = useKit(),
		[ errorType, setErrorType ] = useState( '' ),
		context = useContext( Context ),
		navigate = useNavigate(),
		onDialogDismiss = () => {
			context.dispatch( { type: 'SET_DOWNLOAD_URL', payload: '' } );
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
		};

	useEffect( () => {
		const { includes, kitInfo, plugins } = context.data;

		kitActions.export( {
			include: includes,
			kitInfo,
			plugins: getExportedPluginsData( plugins ),
		} );
	}, [] );

	useEffect( () => {
		switch ( kitState.status ) {
			case KIT_STATUS_MAP.EXPORTED:
				context.dispatch( { type: 'SET_EXPORTED_DATA', payload: kitState.data } );
				break;
			case KIT_STATUS_MAP.ERROR:
				setErrorType( kitState.data );
				break;
		}
	}, [ kitState.status ] );

	useEffect( () => {
		if ( context.data.exportedData ) {
			navigate( 'export/complete' );
		}
	}, [ context.data.exportedData ] );

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
