import { useEffect, useContext, useState } from 'react';
import { useNavigate } from '@reach/router';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

import { Context } from '../../../context/context-provider';

import useAjax from 'elementor-app/hooks/use-ajax';

export default function ImportProcess() {
	const { ajaxState, setAjax, ajaxActions } = useAjax(),
		[ isError, setIsError ] = useState( false ),
		context = useContext( Context ),
		navigate = useNavigate(),
		urlSearchParams = new URLSearchParams( window.location.search ),
		queryParams = Object.fromEntries( urlSearchParams.entries() ),
		// We need to support query-params for external navigations, but also parsing the value from the hash for internal navigation between different routes.
		fileURL = queryParams.file_url || location.hash.match( 'file_url=([^&]+)' )?.[ 1 ],
		isApplyAllForced = 'apply-all' === queryParams.action_type,
		getAjaxConfig = () => {
			return {
				data: {
					action: 'elementor_import_kit',
				},
			};
		},
		uploadKit = () => {
			const ajaxConfig = getAjaxConfig(),
				decodedFileURL = decodeURIComponent( fileURL );

			context.dispatch( { type: 'SET_FILE', payload: decodedFileURL } );

			ajaxConfig.data.e_import_file = decodedFileURL;
			ajaxConfig.data.data = JSON.stringify( {
				stage: 1,
			} );

			const referrer = location.hash.match( 'referrer=([^&]+)' );

			if ( referrer ) {
				context.dispatch( { type: 'SET_REFERRER', payload: referrer[ 1 ] } );
			}

			setAjax( ajaxConfig );
		},
		importKit = () => {
			const ajaxConfig = getAjaxConfig();

			ajaxConfig.data.data = {
				stage: 2,
				session: context.data.fileResponse.stage1.session,
				include: context.data.includes,
				overrideConditions: context.data.overrideConditions,
			};

			if ( context.data.referrer ) {
				ajaxConfig.data.data.referrer = context.data.referrer;
			}

			ajaxConfig.data.data = JSON.stringify( ajaxConfig.data.data );

			setAjax( ajaxConfig );
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
		if ( 'success' === ajaxState.status ) {
			const previousResponse = context.data.fileResponse,
				payload = previousResponse?.stage1 ? { ...previousResponse, stage2: ajaxState.response } : { stage1: ajaxState.response };

			context.dispatch( { type: 'SET_FILE_RESPONSE', payload } );
		} else if ( 'error' === ajaxState.status ) {
			setIsError( true );
		}
	}, [ ajaxState.status ] );

	useEffect( () => {
		if ( 'success' === ajaxState.status ) {
			if ( context.data.fileResponse.hasOwnProperty( 'stage2' ) ) { // After kit upload.
				navigate( '/import/complete' );
			} else if ( isApplyAllForced ) { // Forcing apply-all kit content.
				if ( context.data.fileResponse.stage1.conflicts ) {
					navigate( '/import/resolver' );
				} else {
					// The ajaxState must be reset due to staying in the same page, so that the useEffect will be re-triggered.
					ajaxActions.reset();

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
