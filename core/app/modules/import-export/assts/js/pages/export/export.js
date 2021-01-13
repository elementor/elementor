import { useState } from 'react';
import { Redirect } from '@reach/router';

import Layout from '../../templates/layout';
import ExportContent from './components/export-content/export-content';
import DownloadButton from './components/download-button/download-button';
import Footer from '../../shared/footer/footer';

import '../import-export.scss';
import './export.scss';

export default function Export() {
	const [ isDownloading, setIsDownloading ] = useState( false ),
		getFooter = () => {
			if ( isDownloading ) {
				return;
			}

			return (
				<Footer separator justify="end">
					<DownloadButton setIsDownloading={ setIsDownloading } />
				</Footer>
			);
		};

	console.log( 'RE-RENDERS: Export()' );

	return (
		<Layout type="export" footer={ getFooter() }>
			{ isDownloading ? <Redirect to="/export/complete" noThrow /> : <ExportContent /> }
		</Layout>
	);
}
