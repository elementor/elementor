import { useState, useEffect } from 'react';

import Layout from '../../templates/layout';
import Notice from '../../ui/notice/notice';
import Text from 'elementor-app/ui/atoms/text';

import useFile from '../../hooks/use-file/use-file';

import './import.scss';
import ImportFile from "../../ui/import-file/import-file";

export default function Import() {
	const [ isLoading, setLoading ] = useState( false ),
		{ setFile } = useFile(),
		dragDropEvents = {
			onDrop: ( event ) => {
				setFile( event.dataTransfer.files[ 0 ] );
			},
		};

	useEffect( () => {
		if ( isLoading ) {
			setTimeout( () => {
				setLoading(false);
			}, 8000 );
		}
	}, [ isLoading ] );

	return (
		<Layout type="import">
			<section className="e-app-import">
				<ImportFile
					heading={ __( 'Import a Kit to Your Site', 'elementor' ) }
					text={ __( 'Drag & Drop your zip template file', 'elementor' ) }
					secondaryText={ __( 'Or', 'elementor' ) }
					isLoading={ isLoading }
					onFileSelect={ ( files, e ) => {
						setLoading(true);
						console.log( 'File is ready to be sent: ', files, e );
					} }
				/>
				<Notice color="warning" className="kit-content-list__notice">
					<Text variant="xs">
						{ __( 'Important: It is strongly recommended that you backup your database before Importing a Kit.', 'elementor' ) }
					</Text>
				</Notice>
			</section>
		</Layout>
	);
}

