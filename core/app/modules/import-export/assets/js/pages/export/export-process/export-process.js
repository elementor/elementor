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
		};

	useEffect( () => {
		if ( context.data.downloadUrl ) {
			setAjax( {
				url: context.data.downloadUrl,
				headers: {
					'Content-Type': 'application/json',
				},
			} );
		} else {
			navigate( '/export' );
		}
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
				onDialogApprove={ onDialogDismiss }
				onDialogDismiss={ onDialogDismiss }
			/>
		</Layout>
	);
}
