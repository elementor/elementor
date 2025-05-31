import { useEffect, useContext, useState } from 'react';
import { useNavigate } from '@reach/router';

import { SharedContext } from '../../../context/shared-context/shared-context-provider';
import { ExportContext } from '../../../context/export-context/export-context-provider';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

import useKit, { KIT_SOURCE_MAP } from '../../../hooks/use-kit';
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
		generateScreenshot = () => {
			return new Promise( ( resolve ) => {
				const iframe = document.createElement( 'iframe' );
				iframe.style = 'visibility: hidden;';
				iframe.width = '1200';
				iframe.height = '1000';

				const messageHandler = ( event ) => {
					if ( 'kit-screenshot-done' === event.data.name ) {
						window.removeEventListener( 'message', messageHandler );
						document.body.removeChild( iframe );
						resolve( event.data.imageUrl || null );

						window.removeEventListener( 'message', messageHandler );
					}
				};

				window.addEventListener( 'message', messageHandler );

				const previewUrl = new URL( window.location.origin );
				previewUrl.searchParams.set( 'kit_thumbnail', '1' );
				previewUrl.searchParams.set( 'nonce', elementorAppConfig[ 'import-export' ].kitPreviewNonce );

				document.body.appendChild( iframe );
				iframe.src = previewUrl.toString();
			} );
		},
		exportKit = async () => {
			const { includes, selectedCustomPostTypes } = sharedContext.data;
			/*
				Adding the plugins just before the export process begins for not mixing the kit-content selection with the plugins.
				The plugins must be added to the includes items, otherwise they will not be exported.
				The plugins should always be added in order to include the Core plugin data in the kit.
			 */
			const kitData = {
				include: [ ...includes, 'plugins' ],
				kitInfo,
				plugins: pluginsData,
				selectedCustomPostTypes,
			};

			const isCloudKitFeatureActive = elementorCommon?.config?.experimentalFeatures?.e_cloud_library_kits;

			if ( isCloudKitFeatureActive && KIT_SOURCE_MAP.CLOUD === exportContext.data.kitInfo.source ) {
				const scr = await generateScreenshot();
				kitData.screenShotBlob = scr;
			}

			kitActions.export( kitData );
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
