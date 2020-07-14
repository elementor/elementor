import { useState } from 'react';

import Layout from '../../templates/layout';
import ExportContent from './export-content/export-content';
import Loading from '../../shared/loading/loading';

import '../import-export.scss';
import './export.scss';

export default function Export() {
	const [ isLoading, setIsLoading ] = useState( false );

	return (
		<Layout type="export">
			{ isLoading ? <Loading /> : <ExportContent isLoading={ isLoading } setIsLoading={ setIsLoading } /> }
		</Layout>
	);
}

