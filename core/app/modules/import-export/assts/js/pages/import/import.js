import { useState, useEffect } from 'react';

import Layout from '../../templates/layout';
import Notice from '../../ui/notice/notice';
import Text from 'elementor-app/ui/atoms/text';
import ImportFile from 'elementor-app/organisms/import-file';

import useFile from '../../hooks/use-file/use-file';

import './import.scss';

export default function Import() {
	const [ isLoading, setLoading ] = useState( false ),
		{ setFile } = useFile(),
		onFileSelect = ( files ) => {
			setFile( files[ 0 ] );
		};

	useEffect( () => {
		if ( isLoading ) {
			setTimeout( () => {
				setLoading(false);
			}, 5000 );
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
					onFileSelect={ ( files ) => {
						setLoading(true);
						setFile( files[ 0 ] );
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

