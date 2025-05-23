import { useEffect, useContext, useState } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';
import { ExportContext } from '../../../context/export-context/export-context-provider';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

import useKit from '../../../hooks/use-kit';
import useExportPluginsData from './hooks/use-export-plugins-data';

export default function ExportProcess() {
	const sharedContext = useContext( SharedContext ),
		exportContext = useContext( ExportContext ),
		navigate = useNavigate(),
		{ kitState, kitActions, KIT_STATUS_MAP } = useKit(),
		[ errorType, setErrorType ] = useState( '' ),
		{ plugins, exportedData, kitInfo, isExportProcessStarted } = exportContext.data || {},
		{ pluginsData } = useExportPluginsData( plugins ),
		onDialogDismiss = () => {
			exportContext.dispatch( { type: 'SET_DOWNLOAD_URL', payload: '' } );
			navigate( 'export' );
		},
		exportKit = () => {
			const { includes, selectedCustomPostTypes } = sharedContext.data;

			/*
				Adding the plugins just before the export process begins for not mixing the kit-content selection with the plugins.
				The plugins must be added to the includes items, otherwise they will not be exported.
				The plugins should always be added in order to include the Core plugin data in the kit.
			 */
			kitActions.export( {
				include: [ ...includes, 'plugins' ],
				kitInfo,
				plugins: pluginsData,
				selectedCustomPostTypes,
			} );
		};

	// On load.
	useEffect( () => {
		if ( isExportProcessStarted ) {
			exportKit();
		} else {
			// When not starting from the main screen.
			navigate( '/export' );
		}
	}, [] );

	// On kit status change.
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

	// On process finished.
	useEffect( () => {
		if ( exportedData ) {
			navigate( 'export/complete' );
		}
	}, [ exportedData ] );

	return (
		<Layout type="export">
			<FileProcess
				errorType={ errorType }
				onDialogApprove={ onDialogDismiss }
				onDialogDismiss={ onDialogDismiss }
			/>
		</Layout>
	);
}
