import { useEffect, useContext, useState } from 'react';
import { useNavigate } from '@reach/router';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

import { Context } from '../../../context/context-provider';

import useAjax from 'elementor-app/hooks/use-ajax';

export default function ExportProcess() {
	const { ajaxState, setAjax } = useAjax(),
		[ isError, setIsError ] = useState( false ),
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
		}
	}, [] );

	useEffect( () => {
		if ( 'success' === ajaxState.status ) {
			context.dispatch( { type: 'SET_EXPORTED_DATA', payload: ajaxState.response } );
		} else if ( 'error' === ajaxState.status ) {
			setIsError( true );
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
				isError={ isError }
				onDialogApprove={ () => window.open( 'https://elementor.com/help/export-kit?utm_source=import-export&utm_medium=wp-dash&utm_campaign=learn', '_blank' ) }
				onDialogDismiss={ onDialogDismiss }
			/>
		</Layout>
	);
}
