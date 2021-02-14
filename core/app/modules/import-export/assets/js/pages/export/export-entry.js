import { useState, useEffect, useContext } from 'react';

import { Context } from '../../context/export/export-context';

import Layout from '../../templates/layout';
import ExportKit from './export-kit/export-kit';
import ExportComplete from './export-complete/export-complete';

export default function ExportEntry() {
	const exportContext = useContext( Context ),
		[ isDownloading, setIsDownloading ] = useState( false );

	useEffect( () => {
		if ( exportContext.data.downloadURL ) {
			console.log( 'isDownloading - true' );
			setIsDownloading( true );
		}
	}, [ exportContext.data.downloadURL ] );

	return (
		<Layout type="export">
			<section className="e-app-export">
				{ isDownloading ? <ExportComplete /> : <ExportKit /> }
			</section>
		</Layout>
	);
}
