import { useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

import { Context } from '../../../context/context-provider';

import useAjax from 'elementor-app/hooks/use-ajax';

export default function ImportProcess() {
	const { ajaxState, setAjax } = useAjax(),
		context = useContext( Context ),
		navigate = useNavigate(),
		onLoad = () => {
			// Preventing the ajax request when entering directly to the page.
			if ( context.data.fileResponse ) {
				setAjax( {
					data: {
						action: 'elementor_import_kit',
						data: JSON.stringify( {
							stage: 2,
							session: context.data.fileResponse.stage1.session,
							include: context.data.includes,
							overrideConditions: context.data.overrideConditions,
						} ),
					},
				} );
			}
		},
		onSuccess = () => {
			const previousFileResponse = context.data.fileResponse,
				fileResponse = { ...previousFileResponse, stage2: ajaxState.response };

			context.dispatch( { type: 'SET_FILE_RESPONSE', payload: fileResponse } );
		},
		onDialogDismiss = () => {
			context.dispatch( { type: 'SET_FILE', payload: null } );
			navigate( '/import' );
		};

	useEffect( () => {
		if ( 'success' === ajaxState.status ) {
			navigate( '/import/complete' );
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
