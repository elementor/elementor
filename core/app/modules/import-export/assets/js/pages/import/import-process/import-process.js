import { useEffect, useContext, useState } from 'react';
import { useNavigate } from '@reach/router';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

import { Context } from '../../../context/context-provider';

import useKit from '../../../hooks/use-kit';

export default function ImportProcess() {
	const { kitState, kitActions } = useKit(),
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
				session: context.data.fileResponse.stage1.session,
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
		if ( fileURL || context.data.fileResponse ) {
			if ( fileURL && ! context.data.file ) {
				// When the starting point of the app is the import/process screen and importing via file_url.
				uploadKit();
			} else {
				// When the import/process is the second step of the kit import process, after selecting the kit content.
				importKit();
			}
		}
	}, [] );

	useEffect( () => {
		if ( 'success' === kitState.status ) {
			const previousResponse = context.data.fileResponse,
				payload = previousResponse?.stage1 ? { ...previousResponse, stage2: kitState.response } : { stage1: kitState.response };

			context.dispatch( { type: 'SET_FILE_RESPONSE', payload } );
		} else if ( 'error' === kitState.status ) {
			setIsError( true );
		}
	}, [ kitState.status ] );

	useEffect( () => {
		if ( 'success' === kitState.status ) {
			if ( context.data.fileResponse.hasOwnProperty( 'stage2' ) ) { // After kit upload.
				navigate( '/import/complete' );
			} else if ( isApplyAllForced ) { // Forcing apply-all kit content.
				if ( context.data.fileResponse.stage1.conflicts ) {
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
	}, [ context.data.fileResponse ] );

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
