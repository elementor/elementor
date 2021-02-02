import { useState, useEffect, useContext } from 'react';
import { useNavigate } from '@reach/router';

import { Context } from '../../../context/import/import-context';

import Layout from '../../../templates/layout';
import PageHeader from '../../../ui/page-header/page-header';
import ImportFailedDialog from '../../../shared/import-failed-dialog/import-failed-dialog';
import Notice from 'elementor-app/ui/molecules/notice';
import DropZone from 'elementor-app/organisms/drop-zone';

import './import-kit.scss';

export default function ImportKit() {
	const [ isImportFailed, setIsImportFailed ] = useState( false ),
		importContext = useContext( Context ),
		navigate = useNavigate(),
		resetImportProcess = () => {
			importContext.dispatch( { type: 'SET_FILE', payload: null } );
			setIsImportFailed( false );
		};

	useEffect( () => {
		const selectedFile = importContext.data.file;

		if ( selectedFile ) {
			if ( 'application/zip' === selectedFile.type ) {
				navigate( '/import/process' );
			} else {
				setIsImportFailed( true );
			}
		}
	}, [ importContext.data.file ] );

	return (
		<Layout type="import">
			<section className="e-app-import">
				<PageHeader
					heading={ __( 'Upload Kit File', 'elementor' ) }
					description={ __( 'Upload the kit file.You will be able to see the Kit’s content at the end of the process.', 'elementor' ) }
				/>

				<Notice label={ __( 'Important', 'elementor' ) } color="warning" className="e-app-import__notice">
					{ __( 'It is strongly recommended that you backup your database before Importing a Kit.', 'elementor' ) }
				</Notice>

				<DropZone
					className="e-app-import__drop-zone"
					heading={ __( 'Import a Kit to Your Site', 'elementor' ) }
					text={ __( 'Drag & Drop your zip template file', 'elementor' ) }
					secondaryText={ __( 'Or', 'elementor' ) }
					onFileSelect={ ( files ) => {
						importContext.dispatch( { type: 'SET_FILE', payload: files[ 0 ] } );
					} }
				/>

				{ isImportFailed && <ImportFailedDialog onRetry={ resetImportProcess } /> }
			</section>
		</Layout>
	);
}

