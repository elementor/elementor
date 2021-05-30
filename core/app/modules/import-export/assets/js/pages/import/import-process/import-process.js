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
		fileURL = useRef( location.hash.match( 'file_url=(.+)' ) ),
		onLoad = () => {
			const ajaxConfig = {
				data: {
					action: 'elementor_import_kit',
				},
			};

			if ( fileURL.current || context.data.fileResponse ) {
				if ( fileURL.current ) {
					ajaxConfig.data.e_import_file = fileURL.current[ 1 ];
					ajaxConfig.data.data = JSON.stringify( {
						stage: 1,
					} );
				} else {
					ajaxConfig.data.data = JSON.stringify( {
						stage: 2,
						session: context.data.fileResponse.stage1.session,
						include: context.data.includes,
						overrideConditions: context.data.overrideConditions,
					} );
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
			if ( context.data.fileResponse.stage2 ) {
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
