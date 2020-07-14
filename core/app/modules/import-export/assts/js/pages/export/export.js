import { useState } from 'react';

import Layout from '../../templates/layout';
import ExportContentList from './export-content-list/export-content-list';
import Loading from '../../shared/loading/loading';

import '../import-export.scss';
import './export.scss';

export default function Export() {
	const [ isLoading, setIsLoading ] = useState( false );

	return (
		<Layout type="export">
			{ isLoading ? <Loading /> : <ExportContentList isLoading={ isLoading } setIsLoading={ setIsLoading } /> }
		</Layout>
	);
}

