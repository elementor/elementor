import { useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

import { Context } from '../../../context/export/export-context';

import useAjax from 'elementor-app/hooks/use-ajax';

export default function ExportProcess() {
	const { ajaxState, setAjax } = useAjax( 'e_import_file', 'elementor_import_kit', {
			include: [ 'templates', 'content', 'site-settings' ],
		} ),
		exportContext = useContext( Context ),
		navigate = useNavigate(),
		onLoad = () => {
			if ( exportContext.data.downloadUrl ) {
				setAjax( {
					url: exportContext.data.downloadUrl,
					headers: {
						'Content-Type': 'application/json',
					},
				} );
			}
		},
		onSuccess = () => exportContext.dispatch( { type: 'SET_FILE_RESPONSE', payload: ajaxState.response } ),
		onRetry = () => {
			exportContext.dispatch( { type: 'SET_DOWNLOAD_URL', payload: '' } );
			navigate( 'export' );
		};

	useEffect( () => {
		if ( exportContext.data.fileResponse ) {
			navigate( 'export/complete' );
		}
	}, [ exportContext.data.fileResponse ] );

	return (
		<Layout type="export">
			<FileProcess
				status={ ajaxState.status }
				onLoad={ onLoad }
				onSuccess={ onSuccess }
				onRetry={ onRetry }
			/>
		</Layout>
	);
}
