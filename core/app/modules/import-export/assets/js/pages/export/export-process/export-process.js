import { useEffect, useContext, useState } from 'react';
import { useNavigate } from '@reach/router';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

import { Context } from '../../../context/context-provider';

import useAjax from 'elementor-app/hooks/use-ajax';

export default function ExportProcess() {
	const { ajaxState, setAjax } = useAjax(),
		[ errorType, setErrorType ] = useState( '' ),
		context = useContext( Context ),
		navigate = useNavigate(),
		onDialogDismiss = () => {
			context.dispatch( { type: 'SET_DOWNLOAD_URL', payload: '' } );
			navigate( 'export' );
		},
		getExportedPluginsData = ( plugins ) => {
			const pluginsData = [];

			console.log( 'plugins', plugins );

			plugins.forEach( ( pluginData ) => {
				const { name, plugin, plugin_uri, version } = pluginData;

				pluginsData.push( {
					name,
					plugin,
					plugin_uri,
					version,
				} );
			} );

			return pluginsData;
		};

	useEffect( () => {
		const { includes, kitInfo, plugins } = context.data;

		setAjax( {
			data: {
				action: 'elementor_export_kit',
				data: JSON.stringify( {
					include: includes,
					kitInfo,
					plugins: getExportedPluginsData( plugins ),
				} ),
			},
		} );
	}, [] );

	useEffect( () => {
		if ( 'success' === ajaxState.status ) {
			context.dispatch( { type: 'SET_EXPORTED_DATA', payload: ajaxState.response } );
		} else if ( 'error' === ajaxState.status ) {
			setErrorType( ajaxState.response );
		}
	}, [ ajaxState.status ] );

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
