import { useState, useContext, useEffect } from 'react';
import { useNavigate } from '@reach/router';

import Layout from '../../../templates/layout';
import Message from '../../../ui/message/message';
import ImportFailedDialog from '../../../shared/import-failed-dialog/import-failed-dialog';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import { Context } from '../../../context/import/import-context';

import useUploadFile from '../../../../../../../assets/js/hooks/use-upload-file';

import './import-process-style.scss';

export default function ImportProcess() {
	const [ isImportFailed, setIsImportFailed ] = useState( false ),
		{ setUploadFile, uploadFileStatus } = useUploadFile( 'e_import_file', 'elementor_import_kit', {
			include: [ 'templates', 'content', 'site-settings' ],
		} ),
		importContext = useContext( Context ),
		navigate = useNavigate(),
		resetImportProcess = () => {
			importContext.dispatch( { type: 'SET_FILE', payload: null } );
			navigate( '/import' );
		};

	useEffect( () => {
		setUploadFile( importContext.data.file );
	}, [] );

	useEffect( () => {
		if ( uploadFileStatus.success ) {
			navigate( '/import/success' );
		} else if ( uploadFileStatus.error ) {
			setIsImportFailed( true );
		}
	}, [ uploadFileStatus ] );

	return (
		<Layout type="import">
			<Message className="e-app-import-process">
				<Icon className="e-app-import-process__icon eicon-loading eicon-animation-spin" />

				<Heading variant="display-3" className="e-app-import-process__title">
					{ __( 'Processing your file...', 'elementor' ) }
				</Heading>

				<Text variant="xl" className="e-app-import-process__text">
					{ __( 'This usually takes a few moments.', 'elementor' ) }
					<br />
					{ __( 'Don\'t close this window until your import is finished.', 'elementor' ) }
				</Text>

				{ isImportFailed && <ImportFailedDialog onRetry={ resetImportProcess } /> }
			</Message>
		</Layout>
	);
}
