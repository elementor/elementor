import { useState, useEffect } from 'react';

import Layout from '../../../templates/layout';
import Notice from '../../../ui/notice/notice';
import Title from '../../../ui/title/title';
import DropZone from 'elementor-app/organisms/drop-zone';
import Dialog from 'elementor-app/ui/dialog/dialog';

import useFile from '../../../hooks/use-file/use-file';
import useLink from '../../../hooks/use-link/use-link';

import './import-kit.scss';

export default function ImportKit() {
	const [ isLoading, setLoading ] = useState( false ),
		[ isImportFailed, setIsImportFailed ] = useState( false ),
		{ action } = useLink(),
		{ setFile } = useFile(),
		onFileSelect = ( files ) => {
			setFile( files[ 0 ] );
			setIsImportFailed( false );
		},
		resetImportProcess = () => {
			setIsImportFailed( false );
			setFile( null );
		};

	const getDialog = () => (
		<Dialog
			title={ __( 'Import Failed', 'elementor' ) }
			text={ __( 'We are sorry, but some problem accrued. Please try again. If the problem continues, contact our support.', 'elementor' ) }
			approveButtonColor="primary"
			approveButtonText={ __( 'Retry', 'elementor' ) }
			approveButtonOnClick={ resetImportProcess }
			dismissButtonText={ __( 'Exit', 'elementor' ) }
			dismissButtonOnClick={ action.backToDashboard }
		/>
	);

	useEffect( () => {
		if ( isLoading ) {
			setTimeout( () => {
				setLoading( false );
				setIsImportFailed( true );
			}, 1000 );
		}
	}, [ isLoading ] );

	return (
		<Layout type="import">
			<section className="e-app-import">
				<Title
					primary={ __( 'Upload Kit File', 'elementor' ) }
					secondary={ __( 'Upload the kit file.You will be able to see the Kit’s content at the end of the process.', 'elementor' ) }
				/>

				<Notice label={ __( 'Important', 'elementor' ) } color="warning" className="e-app-import__notice">
					{ __( 'It is strongly recommended that you backup your database before Importing a Kit.', 'elementor' ) }
				</Notice>

				<DropZone
					className="e-app-import__drop-zone"
					heading={ __( 'Import a Kit to Your Site', 'elementor' ) }
					text={ __( 'Drag & Drop your zip template file', 'elementor' ) }
					secondaryText={ __( 'Or', 'elementor' ) }
					isLoading={ isLoading }
					onFileSelect={ ( files ) => {
						setLoading( true );
						setFile( files[ 0 ] );
					} }
				/>

				{ isImportFailed && getDialog() }
			</section>
		</Layout>
	);
}

