import { useEffect, useContext, useState } from 'react';
import { useNavigate } from '@reach/router';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

import { Context } from '../../../context/context-provider';

import useKit from '../../../hooks/use-kit';

export default function ImportProcess() {
	const { kitState, kitActions, KIT_STATUS_MAP } = useKit(),
		[ isError, setIsError ] = useState( false ),
		context = useContext( Context ),
		navigate = useNavigate(),
		urlSearchParams = new URLSearchParams( window.location.search ),
		queryParams = Object.fromEntries( urlSearchParams.entries() ),
		// We need to support query-params for external navigations, but also parsing the value from the hash for internal navigation between different routes.
		fileURL = queryParams.file_url || location.hash.match( 'file_url=([^&]+)' )?.[ 1 ],
		isApplyAllForced = 'apply-all' === queryParams.action_type,
		uploadKit = () => {
			const decodedFileURL = decodeURIComponent( fileURL ),
				referrer = location.hash.match( 'referrer=([^&]+)' );

			if ( referrer ) {
				context.dispatch( { type: 'SET_REFERRER', payload: referrer[ 1 ] } );
			}

			context.dispatch( { type: 'SET_FILE', payload: decodedFileURL } );

			kitActions.upload( { file: decodedFileURL } );
		},
		importKit = () => {
			kitActions.import( {
				session: context.data.uploadedData.session,
				include: context.data.includes,
				overrideConditions: context.data.overrideConditions,
				referrer: context.data.referrer,
			} );
		},
		onDialogDismiss = () => {
			context.dispatch( { type: 'SET_FILE', payload: null } );
			navigate( '/import' );
		};

	useEffect( () => {
		if ( fileURL && ! context.data.file ) {
			// When the starting point of the app is the import/process screen and importing via file_url.
			uploadKit();
		} else if ( context.data.uploadedData ) {
			// When the import/process is the second step of the kit import process, after selecting the kit content.
			importKit();
		}
	}, [] );

	useEffect( () => {
		if ( KIT_STATUS_MAP.INITIAL !== kitState.status ) {
			switch ( kitState.status ) {
				case KIT_STATUS_MAP.IMPORTED:
					context.dispatch( { type: 'SET_IMPORTED_DATA', payload: kitState.data } );
					break;
				case KIT_STATUS_MAP.UPLOADED:
					context.dispatch( { type: 'SET_UPLOADED_DATA', payload: kitState.data } );
					break;
				case KIT_STATUS_MAP.ERROR:
					setIsError( true );
					break;
			}
		}
	}, [ kitState.status ] );

	useEffect( () => {
		if ( KIT_STATUS_MAP.INITIAL !== kitState.status ) {
			if ( context.data.importedData ) { // After kit upload.
				navigate( '/import/complete' );
			} else if ( isApplyAllForced ) { // Forcing apply-all kit content.
				if ( context.data.uploadedData.isConflicts ) {
					navigate( '/import/resolver' );
				} else {
					// The kitState must be reset due to staying in the same page, so that the useEffect will be re-triggered.
					kitActions.reset();

					importKit();
				}
			} else {
				navigate( '/import/content' );
			}
		}
	}, [ context.data.uploadedData, context.data.importedData ] );

	return (
		<Layout type="import">
			<FileProcess
				isError={ isError }
				onDialogApprove={ () => {} }
				onDialogDismiss={ onDialogDismiss }
			/>
		</Layout>
	);
}
