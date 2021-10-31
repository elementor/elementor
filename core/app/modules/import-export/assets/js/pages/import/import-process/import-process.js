import { useEffect, useContext, useRef } from 'react';
import { useNavigate } from '@reach/router';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

import { Context } from '../../../context/context-provider';

import useAjax from 'elementor-app/hooks/use-ajax';

export default function ImportProcess() {
	const { ajaxState, setAjax } = useAjax(),
		context = useContext( Context ),
		navigate = useNavigate(),
		urlSearchParams = new URLSearchParams( window.location.search ),
		queryParams = Object.fromEntries( urlSearchParams.entries() ),
		// We need to support query-params for external navigations, but also parsing the value from the hash for internal navigation between different routes.
		fileURL = queryParams?.[ 'file_url' ] || location.hash.match( 'file_url=([^&]+)' )?.[ 1 ],
		onLoad = () => {
			const ajaxConfig = {
				data: {
					action: 'elementor_import_kit',
				},
			};

			if ( fileURL || context.data.fileResponse ) {
				if ( fileURL && ! context.data.file ) { // When the starting point of the app is the import/process screen and importing via file_url.
					const decodedFileURL = decodeURIComponent( fileURL );

					context.dispatch( { type: 'SET_FILE', payload: decodedFileURL } );

					ajaxConfig.data.e_import_file = decodedFileURL;
					ajaxConfig.data.data = JSON.stringify( {
						stage: 1,
					} );

					const referrer = location.hash.match( 'referrer=([^&]+)' );

					if ( referrer ) {
						context.dispatch( { type: 'SET_REFERRER', payload: referrer[ 1 ] } );
					}
				} else { // When the import/process is the second step of the kit import process, after selecting the kit content.
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
				}

				setAjax( ajaxConfig );
			}
		},
		onSuccess = () => {
			if ( context.data.fileResponse?.stage1 ) {
				const previousFileResponse = context.data.fileResponse,
					fileResponse = { ...previousFileResponse, stage2: ajaxState.response };

				context.dispatch( { type: 'SET_FILE_RESPONSE', payload: fileResponse } );
			} else {
				context.dispatch( { type: 'SET_FILE_RESPONSE', payload: { stage1: ajaxState.response } } );
			}
		},
		onDialogDismiss = () => {
			context.dispatch( { type: 'SET_FILE', payload: null } );
			navigate( '/import' );
		};

	useEffect( () => {
		if ( 'success' === ajaxState.status ) {
			if ( context.data.fileResponse.hasOwnProperty( 'stage2' ) ) {
				navigate( '/import/complete' );
			} else {
				navigate( '/import/content' );
			}
		}
	}, [ context.data.fileResponse ] );

	return (
		<Layout type="import">
			<FileProcess
				status={ ajaxState.status }
				onLoad={ onLoad }
				onSuccess={ onSuccess }
				onDialogApprove={ () => {} }
				onDialogDismiss={ onDialogDismiss }
			/>
		</Layout>
	);
}
