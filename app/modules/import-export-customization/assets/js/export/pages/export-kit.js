import { useState } from 'react';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { BaseLayout, TopBar, Footer, PageHeader } from '../../shared/components';
import ExportIntro from '../components/export-intro';
import ExportKitFooter from '../components/export-kit-footer';
import KitContent from '../components/kit-content';
import KitInfo from '../components/kit-info';
import DropZone from '../../import/components/drop-zone';

export default function ExportKit() {
	const [ error, setError ] = useState( null );

	const footerContent = <ExportKitFooter />;

	const headerContent = (
		<PageHeader title={ __( 'Export', 'elementor' ) } />
	);

	const handleFileSelect = ( file, event, method ) => {
		console.log( 'File selected:', file.name, 'via', method );
		setError( null );
	};

	const handleError = ( error ) => {
		console.error( 'File error:', error );
		setError( error );
	};

	return (
		<BaseLayout
			topBar={ <TopBar>{ headerContent }</TopBar> }
			footer={ <Footer>{ footerContent }</Footer> }
		>
			<Box sx={ { p: 3, mb: 2, maxWidth: '1075px', mx: 'auto' } }>
				<ExportIntro />
				<KitInfo />
				<KitContent />
				
				<Box sx={ { mt: 4 } }>
					<DropZone
						onFileSelect={ handleFileSelect }
						onError={ handleError }
						filetypes={ [ 'application/zip' ] }
						error={ error }
						// helperText={ __( 'Upload a .zip file', 'elementor' ) }
					/>
				</Box>
			</Box>
		</BaseLayout>
	);
}
